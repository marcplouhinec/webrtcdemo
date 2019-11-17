output "webrtcdemo_webapp_ecs_public_ip" {
  value = alicloud_instance.webrtcdemo_webapp_ecs.public_ip
}

output "webrtcdemo_webapp_ecs_domain_name" {
  value = "${alicloud_dns_record.webrtcdemo_webapp_record_oversea.host_record}.${alicloud_dns_record.webrtcdemo_webapp_record_oversea.name}"
}