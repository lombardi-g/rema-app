# Acitivity logger app
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
  <summary>Click to expand</summary>
  
  api details
  
</details>

## Documentations used:
- https://nextjs.org/docs/app
-- https://nextjs.org/docs/app/api-reference/cli/create-next-app
-- https://nextjs.org/docs/app/api-reference/functions/next-response
- https://node-postgres.com/
-- https://node-postgres.com/apis/pool
- https://neon.com/docs
-- https://neon.com/docs/import/import-data-assistant
- https://www.reddit.com/r/Database/comments/1pfqlix/is_neontech_postgresql_good_for_small_startup/
- https://www.prisma.io/docs
-- https://www.prisma.io/docs/prisma-orm/quickstart/postgresql

## Improvements
Since the scope of this project is demonstrating my skills and thought processes, I'll leave the ideas I had of the next steps I would work on to develop this further.
- Encrypt passwords in the users endpoint