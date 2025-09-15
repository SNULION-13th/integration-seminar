# 경량화된 Python 3.10 이미지를 베이스로 사용
FROM --platform=linux/amd64 python:3.10-slim

# 비대화형 모드 설정 (apt-get 등 실행 시 질문 방지)
ENV DEBIAN_FRONTEND=noninteractive

# mysql 클라이언트 등 시스템 의존성 패키지 설치
RUN apt-get update
RUN apt-get install -y --no-install-recommends default-mysql-client
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# 작업 디렉터리 설정
WORKDIR /app

# 파이썬 의존성 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . /app

# 컨테이너가 8000번 포트를 외부에 노출할 것임을 명시
EXPOSE 8000

# 컨테이너 실행 명령. Gunicorn을 이용해 Uvicorn 워커로 앱을 실행 (프로덕션 환경 권장)
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "main:app", "-b", "0.0.0.0:8000"]
