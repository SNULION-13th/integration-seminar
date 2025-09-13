# 베이스가 될 이미지를 지정합니다. mysql 8.0 공식 이미지를 사용합니다.
FROM mysql:8.0

# 컨테이너 내에서 사용할 환경변수를 설정합니다.
# 데이터베이스 이름, 초기 비밀번호 등을 설정할 수 있습니다.
# 이 환경변수는 "실제로" 도커 컨테이너에서 실행 중인 mysql의 계정 정보가 됩니다.
# 따라서 지금은 설명을 위해 하드 코딩했지만 실제로 암호를 직접 작성한 상태로 Dockerfile을 github와 같은 외부 저장소에 업로드하는 것은 굉장히 위험합니다!
ENV SAMPLE_ENV="Likelion 2025" \
    MYSQL_DATABASE="dashboard_db" \
    MYSQL_ROOT_PASSWORD="password" \
    MYSQL_USER="user" \
    MYSQL_PASSWORD="1234" \
    MYSQL_ROOT_HOST=%
    
# 호스트의 파일을 컨테이너 내부로 복사하거나, 컨테이너 내에서 명령을 실행합니다.
RUN mkdir -p /likelion
COPY LICENSE /likelion/LICENSE
RUN echo "echo hi~" > /likelion/echo_hi.txt
RUN echo "$SAMPLE_ENV" > /sample

# 컨테이너가 시작될 때 실행할 기본 명령을 지정합니다.
# 여기서는 mysql 서버를 특정 옵션과 함께 실행합니다.
CMD ["mysqld", \
     "--default-authentication-plugin=caching_sha2_password", \
     "--character-set-server=utf8mb4", \
     "--collation-server=utf8mb4_unicode_ci"]