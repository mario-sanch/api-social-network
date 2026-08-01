import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API red social",
      version: "1.0.0",
      description:
        "API Documentation for social network with express and mongoose, ",
    },
    servers: [
      {
        url: "http://localhost:3900",
        description: "Local Server",
      },
    ],
    // global security definition to request jwt
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insert your token in the format: Bearer <TOKEN>",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
