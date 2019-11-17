//
// Base infrastructure: manage the VPC and VSwitch for the servers.
//

// Alibaba Cloud provider (source: https://github.com/terraform-providers/terraform-provider-alicloud)
provider "alicloud" {}

// VPC and VSwitch
resource "alicloud_vpc" "webrtcdemo_vpc" {
  name = "webrtcdemo-vpc"
  cidr_block = "192.168.0.0/16"
}
data "alicloud_zones" "az" {
  network_type = "Vpc"
  available_disk_category = "cloud_ssd"
}
resource "alicloud_vswitch" "webrtcdemo_vswitch" {
  name = "webrtcdemo-vswitch"
  availability_zone = data.alicloud_zones.az.zones[0].id
  cidr_block = "192.168.0.0/24"
  vpc_id = alicloud_vpc.webrtcdemo_vpc.id
}