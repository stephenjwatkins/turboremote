import { pipeline } from "stream";
import util from "util";

export const pump = util.promisify(pipeline);
