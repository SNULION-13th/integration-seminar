FROM docker.elastic.co/elasticsearch/elasticsearch:8.9.0
RUN elasticsearch-plugin install --batch analysis-nori