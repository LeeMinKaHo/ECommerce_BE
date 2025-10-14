import { ResponseCustom } from "../shared/response-custom";

export const uploadImage = (req, res) => {
   if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
   }

   return res.json(
      new ResponseCustom(
         {
            filename: req.file.filename,
            path: `${req.file.filename}`,
            mimetype: req.file.mimetype,
            size: req.file.size,
         },
         null,
         null
      )
   );
};
