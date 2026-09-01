output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = module.ecs_cluster.ecs_cluster_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "ecs_task_definition_arn" {
  description = "ECS Task Definition ARN"
  value       = aws_ecs_task_definition.game.arn
}

output "ecs_service_name" {
  description = "ECS Service name"
  value       = aws_ecs_service.game.name
}