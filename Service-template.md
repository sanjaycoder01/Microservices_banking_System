service-name/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── kafka.ts
│   │
│   ├── controllers/
│   │   └── *.controller.ts
│   │
│   ├── services/
│   │   └── *.service.ts
│   │
│   ├── repositories/
│   │   └── *.repository.ts
│   │
│   ├── routes/
│   │   └── *.routes.ts
│   │
│   ├── models/
│   │   └── *.model.ts
│   │
│   ├── schemas/
│   │   └── *.schema.ts
│   │
│   ├── dtos/
│   │   ├── request/
│   │   └── response/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── events/
│   │   ├── producers/
│   │   └── consumers/
│   │
│   ├── errors/
│   │   └── app-error.ts
│   │
│   ├── utils/
│   │   └── *.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── constants/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md