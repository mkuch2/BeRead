import { type Request, type Response, Router } from "express";
import { logger } from "../utils/logger";
import prismaClient from "../prismaClient";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";

const router: Router = Router();
const prisma = prismaClient;

router.post(
  "/friend-request",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const { addressee_id } = req.body;
    const requester_id = req.user?.uid as string;

    logger.log("Addressee id: ", addressee_id);
    logger.log("Request id: ", requester_id);

    if (!addressee_id || !requester_id) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    if (addressee_id === requester_id) {
      res.status(400).json({ error: "Can not send friend request to self" });
      return;
    }

    try {
      const relationship = await prisma.relationships.create({
        data: {
          requester_id: requester_id,
          addressee_id: addressee_id,
          status: "PENDING",
        },
      });
      res.status(200).json(relationship);
    } catch (e) {
      res.status(400).json({ error: "Friend request failed" });
    }
  }
);

router.put(
  "/friend-request/:id",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const req_id = req.params.id;
    const { status } = req.body;
    const uid = req.user?.uid;

    try {
      const relationship = await prisma.relationships.update({
        where: {
          id: req_id,
          addressee_id: uid,
        },
        data: { status },
      });
      res.status(200).json(relationship);
    } catch (e) {
      res.status(400).json({ error: "Update failed" });
    }
  }
);

router.delete(
  "/friend-request/reject/:id",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({ error: "Missing required parameter" });
    }

    try {
      const relationship = await prisma.relationships.delete({
        where: {
          id: id,
        },
      });

      res.status(200).json(relationship);
    } catch (e) {
      res.status(500).json({ error: "Could not delete relationship" });
    }
  }
);

router.delete(
  "/friend-request/:id",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const otherUserId = req.params.id;
    const currentUserId = req.user?.uid;

    try {
      const relationships = await prisma.relationships.deleteMany({
        where: {
          OR: [
            {
              requester_id: currentUserId,
              addressee_id: otherUserId,
            },
            {
              requester_id: otherUserId,
              addressee_id: currentUserId,
            },
          ],
        },
      });

      res.status(200).json(relationships);
    } catch (e) {
      res.status(500).json({ error: "Could not delete relationship" });
    }
  }
);

router.get("/friends", verifyToken, async (req: AuthRequest, res: Response) => {
  const uid = req.user?.uid;

  try {
    const friends = await prisma.relationships.findMany({
      where: {
        OR: [
          { requester_id: uid, status: "ACCEPTED" },
          { addressee_id: uid, status: "ACCEPTED" },
        ],
      },
      include: {
        requester: {
          select: {
            username: true,
            name: true,
            currentlyReadingTitle: true,
            currentlyReadingThumbnail: true,
          },
        },
        addressee: {
          select: {
            username: true,
            name: true,
            currentlyReadingTitle: true,
            currentlyReadingThumbnail: true,
          },
        },
      },
    });
    res.status(200).json(friends);
  } catch (e) {
    res.status(500).json({ error: "Failed to get friends" });
  }
});

router.get(
  "/friend-requests",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;

    try {
      const requests = await prisma.relationships.findMany({
        where: {
          addressee_id: uid,
          status: "PENDING",
        },
        select: {
          id: true,
          requester_id: true,
          addressee_id: true,
          status: true,
          requester: {
            select: {
              username: true,
              name: true,
              currentlyReadingTitle: true,
              currentlyReadingThumbnail: true,
            },
          },
          addressee: {
            select: {
              username: true,
              name: true,
              currentlyReadingTitle: true,
              currentlyReadingThumbnail: true,
            },
          },
        },
      });
      res.status(200).json(requests);
    } catch (e) {
      res.status(500).json({ error: "Failed to get requests" });
    }
  }
);

router.get(
  "/friend-request/sent",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;

    try {
      const requests = await prisma.relationships.findMany({
        where: {
          requester_id: uid,
        },
        select: {
          status: true,
        },
      });
      res.status(200).json(requests);
    } catch (e) {
      res.status(500).json({ error: "Failed to get requests" });
    }
  }
);

router.get(
  "/friend-request/sent/:id",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;
    const addressee_id = req.params.id;

    try {
      const request = await prisma.relationships.findUnique({
        where: {
          unique_relationship: {
            requester_id: uid!,
            addressee_id: addressee_id,
          },
        },
        select: {
          status: true,
        },
      });
      res.status(200).json(request);
    } catch (e) {
      res.status(500).json({ error: "Failed to get requests" });
    }
  }
);

router.get(
  "/friend-request/received/:id",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;
    const requestee_id = req.params.id;

    try {
      const request = await prisma.relationships.findUnique({
        where: {
          unique_relationship: {
            requester_id: requestee_id,
            addressee_id: uid!,
          },
        },
        select: {
          status: true,
        },
      });

      res.status(200).json(request);
    } catch (e) {
      res.status(500).json({ error: "Failed to get recieved requests" });
    }
  }
);

export default router;
