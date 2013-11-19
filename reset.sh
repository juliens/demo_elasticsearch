SERVER=127.0.0.1:9200

curl -XDELETE http://$SERVER/forum
#curl -XDELETE http://$SERVER/_river
#curl -XDELETE http://$SERVER/wikipedia
curl -XPUT http://$SERVER/forum --data-binary @settings.json
curl -XPUT http://$SERVER/forum/conference/_mapping --data-binary @mapping.json
#curl -XPUT http://$SERVER/wikipedia --data-binary @settings.json
#curl -XPUT http://$SERVER/wikipedia/page/_mapping --data-binary @mapping_wikipedia.json
curl -XPOST http://$SERVER/_bulk --data-binary @conferences.json
#curl -XPUT http://$SERVER/_river/wikipedia/_meta -d '
#{
#        "type" : "wikipedia",
#    }'

