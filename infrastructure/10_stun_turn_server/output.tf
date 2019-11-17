output "webrtcdemo_stunturn_ecs_public_ip" {
  value = alicloud_instance.webrtcdemo_stunturn_instance_ecs.public_ip
}

output "webrtcdemo_stunturn_ecs_domain_name" {
  value = "${alicloud_dns_record.webrtcdemo_stunturn_record_oversea.host_record}.${alicloud_dns_record.webrtcdemo_stunturn_record_oversea.name}"
}