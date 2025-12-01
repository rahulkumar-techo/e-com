
//  Cleanup unverified users older than 15 minutes 
import cron from "node-cron";
import { User } from "../models/user.model";
import { log } from "../../../../packages/utils";


cron.schedule("*/2 * * * *", async () => {
    const fifteenMinAgo = new Date(Date.now() - 2 * 60 * 1000);

    await User.deleteMany({
        where: {
            isVerified: false,
            createdAt: { lt: fifteenMinAgo },
        },
    });
    log.info("⏳ Deleted unverified users older than 2 minutes:cron");
});
