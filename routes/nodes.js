// import express from 'express';
// import { knownNodes, updateKnownNodes } from '../config.js';

// const router = express.Router();

// // Endpoint POST /nodes - Agregar un nodo
// router.post('/', (req, res) => {
//     const { nodeUrl } = req.body;
//     console.log('Agregando el nodo', nodeUrl);
//     knownNodes = updateKnownNodes([nodeUrl]);
//     console.log("Nodos conocidos:", knownNodes);
//     res.status(201).json({ message: 'Nodo agregado', knownNodes });
// });

// export default router;
