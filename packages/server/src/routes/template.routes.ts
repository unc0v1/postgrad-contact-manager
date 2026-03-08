import multer from 'multer'
import { Router, type Router as RouterType } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { TemplateController } from '../controllers/template.controller.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
})

const router: RouterType = Router()
const ctrl = new TemplateController()

router.use(authMiddleware)

router.get('/', ctrl.list.bind(ctrl))
router.post('/import-folder', ctrl.importFolder.bind(ctrl))
router.post('/upload', upload.single('file'), ctrl.upload.bind(ctrl))
router.get('/:id/preview', ctrl.preview.bind(ctrl))
router.get('/:id/asset', ctrl.asset.bind(ctrl))
router.get('/:id', ctrl.detail.bind(ctrl))
router.post('/', ctrl.create.bind(ctrl))
router.put('/:id', ctrl.update.bind(ctrl))
router.delete('/:id', ctrl.remove.bind(ctrl))

export { router as templateRoutes }
