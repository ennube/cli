
import {Resource} from './common';
import {Model, Schema, getTypeOf, schemas} from '@ennube/sdk';

function send(request) {
    return new Promise((resolve, reject) => {
        request
        .on('success', (response) => resolve(response) )
        .on('error', (response) => reject(response) )
        .send();
    });
}


@Schema.model()
export class Template extends Model {
    @Schema.field({ key: 'AWSTemplateFormatVersion' })
    formatVersion?: string = "2010-09-09";

    @Schema.field({ key: 'Description' })
    description?: string = "";

    @Schema.field({ key: 'Metadata' })
    metadata?: any = {};

    @Schema.field({ key: 'Parameters' })
    parameters?: { [parameterId:string]: Object } = {};

    @Schema.field({ key: 'Mappings' })
    mappings?: { [mappingId:string]: Object } = {};

    @Schema.field({ key: 'Conditions'})
    conditions?: { [conditionId:string]: Object } = {};

    @Schema.field({ key: 'Resources', nextTypes: [Resource]})
    resources: { [resourceId:string]: Resource } = {};

    @Schema.field({ key: 'Outputs'})
    outputs?: { [outputId:string]: Object } = {};
}


/*
AWS::ApiGateway::Account
AWS::ApiGateway::ApiKey
AWS::ApiGateway::Authorizer
AWS::ApiGateway::BasePathMapping
AWS::ApiGateway::ClientCertificate
AWS::ApiGateway::Deployment
AWS::ApiGateway::Method
AWS::ApiGateway::Model
AWS::ApiGateway::Resource
AWS::ApiGateway::RestApi
AWS::ApiGateway::Stage

AWS::S3::Bucket
AWS::S3::BucketPolicy

AWS::Lambda::EventSourceMapping
AWS::Lambda::Alias
AWS::Lambda::Function
AWS::Lambda::Permission
AWS::Lambda::Version

AWS::Route53::HealthCheck
AWS::Route53::HostedZone
AWS::Route53::RecordSet
AWS::Route53::RecordSetGroup

AWS::DynamoDB::Table

AWS::IAM::AccessKey
AWS::IAM::Group
AWS::IAM::InstanceProfile
AWS::IAM::ManagedPolicy
AWS::IAM::Policy
AWS::IAM::Role
AWS::IAM::User
AWS::IAM::UserToGroupAddition

AWS::SNS::Topic
AWS::SNS::TopicPolicy
AWS::SQS::Queue
AWS::SQS::QueuePolicy

AWS::ApplicationAutoScaling::ScalableTarget
AWS::ApplicationAutoScaling::ScalingPolicy
AWS::AutoScaling::AutoScalingGroup
AWS::AutoScaling::LaunchConfiguration
AWS::AutoScaling::LifecycleHook
AWS::AutoScaling::ScalingPolicy
AWS::AutoScaling::ScheduledAction
AWS::CertificateManager::Certificate
AWS::CloudFormation::Authentication
AWS::CloudFormation::CustomResource
AWS::CloudFormation::Init
AWS::CloudFormation::Interface
AWS::CloudFormation::Stack
AWS::CloudFormation::WaitCondition
AWS::CloudFormation::WaitConditionHandle
AWS::CloudFront::Distribution
AWS::CloudTrail::Trail
AWS::CloudWatch::Alarm
AWS::CodeDeploy::Application
AWS::CodeDeploy::DeploymentConfig
AWS::CodeDeploy::DeploymentGroup
AWS::CodePipeline::CustomActionType
AWS::CodePipeline::Pipeline
AWS::Config::ConfigRule
AWS::Config::ConfigurationRecorder
AWS::Config::DeliveryChannel
AWS::DataPipeline::Pipeline
AWS::DirectoryService::MicrosoftAD
AWS::DirectoryService::SimpleAD

AWS::EC2::CustomerGateway
AWS::EC2::DHCPOptions
AWS::EC2::EIP
AWS::EC2::EIPAssociation
AWS::EC2::FlowLog
AWS::EC2::Host
AWS::EC2::Instance
AWS::EC2::InternetGateway
AWS::EC2::NatGateway
AWS::EC2::NetworkAcl
AWS::EC2::NetworkAclEntry
AWS::EC2::NetworkInterface
AWS::EC2::NetworkInterfaceAttachment
AWS::EC2::PlacementGroup
AWS::EC2::Route
AWS::EC2::RouteTable
AWS::EC2::SecurityGroup
AWS::EC2::SecurityGroupEgress
AWS::EC2::SecurityGroupIngress
AWS::EC2::SpotFleet
AWS::EC2::Subnet
AWS::EC2::SubnetNetworkAclAssociation
AWS::EC2::SubnetRouteTableAssociation
AWS::EC2::Volume
AWS::EC2::VolumeAttachment
AWS::EC2::VPC
AWS::EC2::VPCDHCPOptionsAssociation
AWS::EC2::VPCEndpoint
AWS::EC2::VPCGatewayAttachment
AWS::EC2::VPCPeeringConnection
AWS::EC2::VPNConnection
AWS::EC2::VPNConnectionRoute
AWS::EC2::VPNGateway
AWS::EC2::VPNGatewayRoutePropagation
AWS::ECR::Repository
AWS::ECS::Cluster
AWS::ECS::Service
AWS::ECS::TaskDefinition
AWS::EFS::FileSystem
AWS::EFS::MountTarget
AWS::ElastiCache::CacheCluster
AWS::ElastiCache::ParameterGroup
AWS::ElastiCache::ReplicationGroup
AWS::ElastiCache::SecurityGroup
AWS::ElastiCache::SecurityGroupIngress
AWS::ElastiCache::SubnetGroup
AWS::ElasticBeanstalk::Application
AWS::ElasticBeanstalk::ApplicationVersion
AWS::ElasticBeanstalk::ConfigurationTemplate
AWS::ElasticBeanstalk::Environment
AWS::ElasticLoadBalancing::LoadBalancer
AWS::ElasticLoadBalancingV2::Listener
AWS::ElasticLoadBalancingV2::ListenerRule
AWS::ElasticLoadBalancingV2::LoadBalancer
AWS::ElasticLoadBalancingV2::TargetGroup
AWS::Elasticsearch::Domain
AWS::EMR::Cluster
AWS::EMR::InstanceGroupConfig
AWS::EMR::Step
AWS::Events::Rule
AWS::GameLift::Alias
AWS::GameLift::Build
AWS::GameLift::Fleet

AWS::IoT::Certificate
AWS::IoT::Policy
AWS::IoT::PolicyPrincipalAttachment
AWS::IoT::Thing
AWS::IoT::ThingPrincipalAttachment
AWS::IoT::TopicRule
AWS::Kinesis::Stream
AWS::KinesisFirehose::DeliveryStream
AWS::KMS::Key

AWS::Logs::Destination
AWS::Logs::LogGroup
AWS::Logs::LogStream
AWS::Logs::MetricFilter
AWS::Logs::SubscriptionFilter
AWS::OpsWorks::App
AWS::OpsWorks::ElasticLoadBalancerAttachment
AWS::OpsWorks::Instance
AWS::OpsWorks::Layer
AWS::OpsWorks::Stack
AWS::RDS::DBCluster
AWS::RDS::DBClusterParameterGroup
AWS::RDS::DBInstance
AWS::RDS::DBParameterGroup
AWS::RDS::DBSecurityGroup
AWS::RDS::DBSecurityGroupIngress
AWS::RDS::DBSubnetGroup
AWS::RDS::EventSubscription
AWS::RDS::OptionGroup
AWS::Redshift::Cluster
AWS::Redshift::ClusterParameterGroup
AWS::Redshift::ClusterSecurityGroup
AWS::Redshift::ClusterSecurityGroupIngress
AWS::Redshift::ClusterSubnetGroup

AWS::SDB::Domain

AWS::SSM::Document
AWS::WAF::ByteMatchSet
AWS::WAF::IPSet
AWS::WAF::Rule
AWS::WAF::SizeConstraintSet
AWS::WAF::SqlInjectionMatchSet
AWS::WAF::WebACL
AWS::WAF::XssMatchSet
AWS::WorkSpaces::Workspace
*/
