# Ennube
**Currently in 0.1-alpha status.**
A service-oriented architecture for the development of cloud based web
applications. Ennube integrates directly with Typescript and Amazon Web
Services, creating a bridge between language and platform.

## Integrated services and features

- [x] The application code is segmented in microservices to be deployed as
    lambda functions, all automatically.
- [x] Your application can declare http endpoints using Typescript decorators,
    these endpoints will be automatically represented in the service gateway
    api.
- [x] Storage buckets used in your application code will be added to your cloud
    stack automatically, the application can access the resource through the
    ennube runtime layer.
