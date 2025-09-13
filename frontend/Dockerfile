# 경량화된 Nginx 이미지 사용
FROM nginx:alpine

# Nginx의 기본 정적 파일 디렉토리로 이동
WORKDIR /usr/share/nginx/html

# 현재 디렉토리의 파일들을 컨테이너로 복사
COPY index.html main.js styles.css favicon.ico ./

# Nginx의 기본 포트인 80번을 노출
EXPOSE 80
