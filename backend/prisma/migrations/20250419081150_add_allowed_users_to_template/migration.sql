-- CreateTable
CREATE TABLE "_TemplateAccess" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TemplateAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TemplateAccess_B_index" ON "_TemplateAccess"("B");

-- AddForeignKey
ALTER TABLE "_TemplateAccess" ADD CONSTRAINT "_TemplateAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateAccess" ADD CONSTRAINT "_TemplateAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
