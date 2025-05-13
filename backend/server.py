import os
import uuid

from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from werkzeug.utils import secure_filename
import datetime
app = Flask(__name__)

# 定义 API 服务器的 IP 地址和端口号变量（用于记录和调试）
BASE_URL = "http://10.150.255.82:3000"  # 你可以随时修改

# 数据库连接配置
DB_CONFIG = {
    'host': '10.150.255.82',
    'user': 'Li',
    'password': '123456',   # 请替换为实际密码
    'database': 'journal',
    'auth_plugin': 'caching_sha2_password'
}

def get_db_connection():
    """创建并返回一个数据库连接"""
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn


# 上传目录（请根据实际情况配置绝对路径或相对路径）
UPLOAD_FOLDER_IMG = 'img/diary_image'    # 服务器中存放图片的目录
UPLOAD_FOLDER_VIDEO = 'video'  # 服务器中存放视频的目录

# 确保上传目录存在
os.makedirs(UPLOAD_FOLDER_IMG, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_VIDEO, exist_ok=True)

# 配置允许上传的文件扩展名
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mkv', 'avi'}

app.config['UPLOAD_FOLDER_IMG'] = UPLOAD_FOLDER_IMG
app.config['UPLOAD_FOLDER_VIDEO'] = UPLOAD_FOLDER_VIDEO

def allowed_file(filename, allowed_exts):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts

@app.route('/media_delete', methods=['POST'])
def delete_media():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400

    images = data.get('images', [])
    videos = data.get('videos', [])
    travel_log_id=data.get('travel_log_id')
    if not isinstance(images, list) or not isinstance(videos, list):
        return jsonify({'error': 'Invalid format for images or videos'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 处理图片
            for url in images:
                if '/img/diary_image/' in url:
                    # 删除数据库记录
                    sql = "DELETE FROM travel_log_images WHERE image_url = %s and travel_log_id = %s"
                    cursor.execute(sql, (url,travel_log_id))

            # 处理视频
            for url in videos:
                if '/video/' in url:
                    sql = "DELETE FROM travel_log_videos WHERE video_url = %s and travel_log_id= %s"
                    cursor.execute(sql, (url,travel_log_id))

            conn.commit()

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Media deleted successfully'}), 200


#获取上传的图片和视频并保存到本地
@app.route('/upload_media', methods=['POST'])
def upload_media():
    print(f"Request method: {request.method}")
    print(f"Request path: {request.path}")
    # 判断是否存在文件部分
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 获取文件类型参数，应该是 'image' 或 'video'
    filetype = request.form.get('filetype')
    if filetype not in ['image', 'video']:
        return jsonify({'error': 'Invalid filetype, must be "image" or "video"'}), 400

    filename = secure_filename(file.filename)
    if filetype == 'image':
        if file and allowed_file(filename, ALLOWED_IMAGE_EXTENSIONS):
            save_path = os.path.join(app.config['UPLOAD_FOLDER_IMG'], filename)
            file.save(save_path)
            # 假设最终访问地址为 /img/filename
            file_url = f'/img/diary_image/{filename}'
        else:
            return jsonify({'error': 'Invalid image file'}), 400
    else:  # filetype == 'video'
        if file and allowed_file(filename, ALLOWED_VIDEO_EXTENSIONS):
            save_path = os.path.join(app.config['UPLOAD_FOLDER_VIDEO'], filename)
            file.save(save_path)
            file_url = f'/video/{filename}'
        else:
            return jsonify({'error': 'Invalid video file'}), 400

    # 保存文件 URL 到数据库，例如，根据文件类型存储到不同的表中
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            if filetype == 'image':
                # 假设表名为 travel_log_images，字段 travel_log_id 和 image_url
                sql = "INSERT INTO travel_log_images (travel_log_id, image_url) VALUES (%s, %s)"
            else:
                # 假设表名为 travel_log_videos，字段 travel_log_id 和 video_url
                sql = "INSERT INTO travel_log_videos (travel_log_id, video_url) VALUES (%s, %s)"
            # 这里假设通过表单提交中还附带了 travel_log_id
            travel_log_id = request.form.get('travel_log_id')
            if not travel_log_id:
                return jsonify({'error': '缺少 travel_log_id 参数'}), 400
            cursor.execute(sql, (travel_log_id, file_url))
            conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Upload successful', 'file_url': file_url}), 200



@app.route('/users/partial', methods=['GET'])
def get_users_partial():
    """
    获取 users 表中部分列数据，例如：id, nickname, avatar, gender
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # 只读取需要的列
    sql = 'SELECT id, nickname, avatar, gender FROM users'
    cursor.execute(sql)
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)

# 查询指定行列值
@app.route('/travel_logs/get', methods=['GET'])
def get_travel_logs():
    """
    获取 travel_logs 表中部分列数据。
    支持以下 query 参数：
      - seq_id：根据 seq_id 筛选记录（唯一记录）。
      - column：指定返回数据库中的哪一列数据（例如 column=title 返回 title 列）。
        如果未提供或参数非法，则默认返回数据包括：id, title, image, videos, 以及根据 travel_logs.author_id 在 users 表查询得到的 nickname 与 avatar。
      - page：分页参数，当前页码（仅当未提供 seq_id 时启用）。
      - pageSize：分页参数，每页返回的记录数（仅当未提供 seq_id 时启用）。
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 获取参数
    seq = request.args.get('seq_id')
    column_param = request.args.get('column')

    # 限定允许查询的字段集合
    allowed_columns = {'id', 'title', 'image', 'author_id', 'avatar', 'content', 'status', 'rejectionReason', 'seq_id', 'nickname'}

    if column_param and column_param in allowed_columns:
        # 当只查询单独列时，同时返回 id
        select_clause = "t.id, t." + column_param
        join_clause = ""
    else:
        # 默认返回 t.id, t.title, 多张图片合并成 image, 多条视频合并成 videos, 以及 users 表中的 nickname 与 avatar
        select_clause = (
            "t.id, t.title,t.content, GROUP_CONCAT(DISTINCT i.image_url) AS image, "
            "GROUP_CONCAT(DISTINCT v.video_url) AS videos, u.nickname, u.avatar"
        )
        join_clause = (
            " LEFT JOIN users u ON t.author_id = u.id "
            "LEFT JOIN travel_log_images i ON t.id = i.travel_log_id "
            "LEFT JOIN travel_log_videos v ON t.id = v.travel_log_id"
        )

    # 构造基本 SQL 语句（使用 GROUP_CONCAT 时需要加 GROUP BY，避免返回重复行）
    sql = "SELECT {select_clause} FROM travel_logs t {join_clause}".format(
        select_clause=select_clause,
        join_clause=join_clause
    )
    params = []

    if seq:
        sql += " WHERE t.seq_id = %s"
        params.append(seq)
    else:
        # 获取分页参数
        page = request.args.get('page', type=int)
        page_size = request.args.get('pageSize', type=int) or request.args.get('pagesize', type=int)
        if page and page_size:
            offset = (page - 1) * page_size
            sql += " GROUP BY t.id LIMIT %s, %s"
            params.extend([offset, page_size])
        else:
            sql += " GROUP BY t.id"

    cursor.execute(sql, params)
    result = cursor.fetchone() if seq else cursor.fetchall()

    # 对查询结果中的 image 与 videos 字段进行处理：
    # 如果聚合结果不为空，则将逗号分隔的字符串转换为数组，否则返回空数组
    if result:
        if seq:
            result["image"] = result.get("image", "")
            result["videos"] = result.get("videos", "")
            result["image"] = result["image"].split(',') if result["image"] else []
            result["videos"] = result["videos"].split(',') if result["videos"] else []
        else:
            for row in result:
                row["image"] = row.get("image", "")
                row["videos"] = row.get("videos", "")
                row["image"] = row["image"].split(',') if row["image"] else []
                row["videos"] = row["videos"].split(',') if row["videos"] else []

    cursor.close()
    conn.close()

    if not result:
        return jsonify({"error": "未找到记录"}), 404

    return jsonify(result)

#查询总行数
@app.route('/travel_logs/count', methods=['GET'])
def get_travel_logs_count():
    """
    返回 travel_logs 表中的数据总行数。
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 统计数据总行数
    sql = "SELECT COUNT(*) AS total FROM travel_logs"
    cursor.execute(sql)
    result = cursor.fetchone()  # 返回形如 {'total': 123} 的字典

    cursor.close()
    conn.close()

    if not result:
        return jsonify({"error": "没有找到记录"}), 404
    return jsonify(result)

#查询id对应的字段
@app.route('/User/get', methods=['GET'])
def get_user_travel_logs():
    # 获取传入的 id 参数
    user_id = request.args.get('id')
    if not user_id:
        return jsonify({"error": "缺少 id 参数"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # 修改查询SQL，增加 t.id 到返回结果中
    sql = """
        SELECT t.id, t.title, t.content, t.status, t.rejectionReason,
               GROUP_CONCAT(DISTINCT i.image_url) AS image,
               GROUP_CONCAT(DISTINCT v.video_url) AS videos
        FROM travel_logs t
        LEFT JOIN travel_log_images i ON t.id = i.travel_log_id
        LEFT JOIN travel_log_videos v ON t.id = v.travel_log_id
        WHERE t.author_id = %s
        GROUP BY t.id
    """
    try:
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()
        if not rows:
            return jsonify({"error": "未找到对应的日志记录"}), 404

        # 将 GROUP_CONCAT 得到的字符串拆分为数组。若无数据，则返回空数组。
        for row in rows:
            if row.get("image"):
                row["image"] = row["image"].split(',')
            else:
                row["image"] = []
            if row.get("videos"):
                row["videos"] = row["videos"].split(',')
            else:
                row["videos"] = []

        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


#根据日志id获取数据
@app.route('/travel_logs/detail', methods=['GET'])
def get_travel_log_detail():
    # 从 query 参数中获取日志 id
    log_id = request.args.get('id')
    if not log_id:
        return jsonify({"error": "缺少日志 id 参数"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 查询 travel_logs 表中对应的记录
        sql_log = "SELECT * FROM travel_logs WHERE id = %s"
        cursor.execute(sql_log, (log_id,))
        log = cursor.fetchone()
        if log is None:
            return jsonify({"error": "未找到记录"}), 404

        # 查询对应的图片 URL
        sql_images = "SELECT image_url FROM travel_log_images WHERE travel_log_id = %s"
        cursor.execute(sql_images, (log_id,))
        images = cursor.fetchall()
        # 将图片查询结果转换为数组
        image_urls = [row["image_url"] for row in images] if images else []

        # 查询对应的视频 URL
        sql_videos = "SELECT video_url FROM travel_log_videos WHERE travel_log_id = %s"
        cursor.execute(sql_videos, (log_id,))
        videos = cursor.fetchall()
        # 将视频查询结果转换为数组
        video_urls = [row["video_url"] for row in videos] if videos else []

        # 将图片和视频数组加入返回结果中
        log["image"] = image_urls
        log["videos"] = video_urls

        return jsonify(log)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/travel_logs/<log_id>', methods=['Put'])
def update_travel_log(log_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': '无效请求数据'}), 400

    title = data.get('title')
    content = data.get('content')
    status = data.get('status')
    # 这里 images 与 videos 均为远程 URL 数组（通过上传接口获得）
    images = data.get('image', [])
    videos = data.get('videos', [])

    if not title or not content or not status:
        return jsonify({'error': '缺少必要字段'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 更新主记录
        sql_update = "UPDATE travel_logs SET title=%s, content=%s, status=%s WHERE id=%s"
        cursor.execute(sql_update, (title, content, status, log_id))
        conn.commit()
        return jsonify({'message': '保存成功'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/Create_Travel_Log', methods=['POST'])
def create_travel_log():
    # 从 query 参数中获取 user_id
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': '缺少 user_id 参数'}), 400

    # 生成唯一不重复的 UUID 字符串（36个字符）
    new_id = str(uuid.uuid4())

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 此处将 autor_id 赋值为 user_id
            sql = "INSERT INTO travel_logs (id, author_id,title) VALUES (%s, %s,1)"
            cursor.execute(sql, (new_id, user_id))
        conn.commit()
        return jsonify({'message': '创建成功', 'id': new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/Delete_Travel_Log/<log_id>', methods=['DELETE'])
def delete_travel_log(log_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 先删除依赖 travel_logs 的数据，
            # 例如删除 travel_log_images 表中所有关联该 travel_log_id 的记录
            cursor.execute("DELETE FROM travel_log_images WHERE travel_log_id = %s", (log_id,))
            # 如果还有其他依赖（如 travel_log_videos），也可以依此删除：
            cursor.execute("DELETE FROM travel_log_videos WHERE travel_log_id = %s", (log_id,))

            # 再删除 travel_logs 表中的数据
            affected_rows = cursor.execute("DELETE FROM travel_logs WHERE id = %s", (log_id,))
        conn.commit()
        if affected_rows == 0:
            return jsonify({'error': f'未找到 id 为 {log_id} 的日志记录'}), 404
        return jsonify({'message': '删除成功'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()



if __name__ == '__main__':
    # 启动时打印 BASE_URL 以便调试
    print(f"API running at {BASE_URL} ...")
    app.run(host='0.0.0.0', port=3000)