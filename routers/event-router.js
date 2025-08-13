const { EventList, EventCreate, GetEvent, EventUpdate, EventDelete, EventRegister } = require("./../controllers/event-controller.js")
const router = require("express").Router()

router.post("/event", EventCreate);
router.get("/event", EventList);
router.get("/event/:id", GetEvent);
router.post("/event/:id/register", EventRegister)
router.put("/event/:id", EventUpdate);
router.delete("/event/:id", EventDelete);

module.exports = router;
