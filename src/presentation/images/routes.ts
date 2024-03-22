import { Router } from "express";
import { ImagesController } from "./controller";


export class ImageRoutes {

    static get routes():Router {

        const router = Router();
        const controller = new ImagesController()

        router.get('/:type/:img', controller.getImage )

        return router;
    }


}