variable "domain_name" {
  description = "Domain name of the project."
  default = "my-example-domain.xyz"
}

variable "stunturn_sub_domain_name" {
  description = "Sub-domain name of the STUN / TURN server."
  default = "webrtcdemo-stunturn"
}

variable "ecs_root_password" {
  description = "ECS root password (simpler to configure than key pairs)"
  default = "YourR00tP@ssword"
}

variable "stunturn_user" {
  description = "Username to authenticate to the STUN / TURN server."
  default = "webrtcdemo"
}

variable "stunturn_password" {
  description = "Password to authenticate to the STUN / TURN server."
  default = "Shenzhen2019"
}