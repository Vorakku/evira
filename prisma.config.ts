import { defineConfig } from 'prisma/config';
export default defineConfig({schema:'prisma/schema.prisma',migrations:{path:'drizzle'},datasource:{url:'file:./evira.sqlite'}});
