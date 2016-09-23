# Ennube

Ennube is a [Typescript] web framework that faces the development of
applications that will be run as multiple [AWS Lambda] microservices. For this,
ennube provides an command line interface to perform simple construction and
deployment of the application, and a runtime library that lets meet ennube the
needs of the resource stack of your application. Do not need to deal with
configuration files for it, enube meet the needs of your application looking
into it, then recreate the cloud where it streak across the sky.

With a few lines of code your application will be deployed in the cloud
automatically. Watch this:


```typescript
// app.js
import {http} from '@ennube/runtime';

let web = new http.Gateway('web');

declare function page(locales): string;

export class IndexHTTPService {

    @web.GET('/')
    @web.GET('/{route+}')
    index(req: http.Request, res: http.Response) {
        res.send(page({
              route: req.route
        }));
    }

}
```

```Pug
// app.page.pug
doctype html
html(lang='en')
    head
        meta(charset='utf-8')
        title Ennube starter project
    body
        h1=`You are browsing ${route}`
```
`> ennube deploy`

Thats all, your application are online, zero config, no servers.
**Cloud application development was never easier**. ;)

## Features

- Precompiled [Pug] templates be injected into your source code, you only have
to invoke them as a function to generate the html response.
- The source code of your application is segmented into microservices, packaged
and deployed automatically.
- The stack of the resources needed to run the application is created or updated
automatically deployments.

**0.2 beta**: we have just started, do not use this software, even.

[Typescript]: <https://www.typescriptlang.org/index.html>
[AWS Lambda]: <https://aws.amazon.com/lambda/details/>
[Pug]: <https://pugjs.org>
