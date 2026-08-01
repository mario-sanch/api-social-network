import express from "express";
const userRouter = express.Router();
import multer from "multer";
import { auth } from "../middleware/auth.js";
import {
  userRegisterRules,
  validateResult,
} from "../middleware/userValidator.js";

import {
  register,
  login,
  profile,
  list,
  update,
  uploadImg,
  avatar,
} from "../controllers/userController.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

userRouter.post("/users", userRegisterRules, validateResult, register);

userRouter.post("/users/login", login);

userRouter.get("/users/profile/:id", auth, profile);

/**
 * @swagger
 * /users/list:
 *   get:
 *     summary: Obtiene la lista paginada de usuarios con filtros y ordenamiento
 *     description: Retorna un listado de usuarios. Requiere rol de administrador.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página que se desea consultar.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Cantidad de usuarios por página (máximo 100).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar por nombre o correo electrónico.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Campo por el cual ordenar los registros (ej. name, email, createdAt).
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sentido del ordenamiento (ascendente o descendente).
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 appliedFilters:
 *                   type: object
 *       400:
 *         description: Petición inválida (Parámetros incorrectos).
 *       401:
 *         description: No autorizado (Token faltante).
 *       403:
 *         description: Prohibido (Token inválido o falta de rol de administrador).
 *       500:
 *         description: Error interno del servidor.
 */
userRouter.get("/users", auth, list);

userRouter.put("/users", auth, update);

userRouter.post("/user/image", auth, uploads.single("file0"), uploadImg);

userRouter.get("/users/avatar/:file", auth, avatar);

export { userRouter };
