import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 设置全局路由前缀
  app.setGlobalPrefix('seafogai');
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe());
  
  // 配置CORS
  app.enableCors();
  
  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('Seafogai API')
    .setDescription('Seafogai 工具集')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('https://tool.tmmk.cc') // 生产环境服务器
    .addServer('http://localhost:3000') // 本地开发服务器
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('seafogai/api', app, document);

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap(); 