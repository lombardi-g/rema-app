# Activity logger app
This project is part of a selection process.
It consists of an activity log app with authentication, database updates and a cloud-hosted api.

## Frontend
The initial idea consisted of an auth screen that validates users, which leads to production screen
[registro-atividades/public/app-screen1.jpg] ref
[registro-atividades/public/app-screen2.jpg] ref

in logging, only a description is prompted, as the app searches for brazilian current time for logging (GMT-3).

## Architecture
This sketching demonstrates how to build and deploy the app, using free services while preparing for scalability.
[public/sketch1.jpg] ref

## API documentation
Since 
<details>
  <summary>API documentation</summary>
  
  ### Activities
  Search information on logged activities
  #### GET
  `/api?resource=activities`
  <br>Response sample

```json
  [{
  "description":"test log 1",
  "createdAt":"2026-06-09T16:10:09.000Z",
  "id":2,
  "userId":1
  }]
  ```
  #### POST
  Insert a new entry in the database by providing an Id and description
| Parameter        | requirement           |
| ------------- |:-------------:|
| Id      | required |
| Description| required   |

`/api...`
<br> Response sample

```json
[{
  "description":"test log 2",
  "createdAt":"2026-06-09T17:25:19.000Z",
  "id":2,
  "userId":1,
  "status": 201
}]
```

  #### DELETE
  Delete an entry by providing an Id
| Parameter        | requirement           |
| ------------- |:-------------:|
| Id      | required |

`/api...`

<br> Response sample

```json
[{
"message": "activity deleted",
"status": 200
}]
```
---
</details>

## Research done:
* https://nextjs.org/docs/app
    * setting up: https://nextjs.org/docs/app/api-reference/cli/create-next-app
    * API route: https://nextjs.org/docs/app/api-reference/functions/next-response
    * Layot and pages: https://nextjs.org/docs/app/getting-started/layouts-and-pages
* https://node-postgres.com/
    * https://node-postgres.com/apis/pool
* https://neon.com/docs
    * https://neon.com/docs/import/import-data-assistant
* https://www.reddit.com/r/Database/comments/1pfqlix/is_neontech_postgresql_good_for_small_startup/
* https://www.prisma.io/docs
    * https://www.prisma.io/docs/prisma-orm/quickstart/postgresql
* https://next-auth.js.org/getting-started/example
    * structure: https://next-auth.js.org/configuration/initialization
    * nextauth: https://next-auth.js.org/providers/credentials and https://next-auth.js.org/configuration/pages
    * middleware: https://next-auth.js.org/configuration/nextjs
* https://docs.docker.com/reference/dockerfile
    * https://medium.com/@jaymesonmendes/setting-up-a-ci-cd-pipeline-with-github-actions-dockerhub-and-kubernetes-04b147867907
* https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_iduses
    * https://medium.com/@jjzcru/building-a-ci-cd-pipeline-with-vercel-and-github-actions-f80d3a4a7de3
    * https://medium.com/@jaymesonmendes/setting-up-a-ci-cd-pipeline-with-github-actions-dockerhub-and-kubernetes-04b147867907 and https://github.com/docker/login-action
    * https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate
    * https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel

## Improvements
Since the scope of this project is demonstrating my skills and thought processes, I'll leave the ideas I had of the next steps I would work on to develop this further.
- In production, passwords should be hashed using bcrypt
- Restrict POST and DELETE usage with tokens in endpoint