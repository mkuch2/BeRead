-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "firebase_uid" VARCHAR(128) NOT NULL,
    "bio" TEXT,
    "name" VARCHAR(255),
    "currentlyReadingAuthors" VARCHAR(500),
    "currentlyReadingId" VARCHAR(255),
    "currentlyReadingThumbnail" VARCHAR(500),
    "currentlyReadingTitle" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "book_title" VARCHAR(255) NOT NULL,
    "pages" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quote" VARCHAR(255) NOT NULL,
    "author" VARCHAR(100)[],
    "username" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" VARCHAR(255),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" VARCHAR(128) NOT NULL,
    "post_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR(255) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "parent_comment_id" UUID,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" VARCHAR(128) NOT NULL,
    "post_id" UUID NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_reactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" VARCHAR(128) NOT NULL,
    "comment_id" UUID NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_books" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bookId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "authors" VARCHAR(500) NOT NULL,
    "thumbnail" VARCHAR(500),
    "user_id" VARCHAR(128) NOT NULL,

    CONSTRAINT "favorite_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "requester_id" VARCHAR(128) NOT NULL,
    "addressee_id" VARCHAR(128) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_post_book_title" ON "posts"("book_title");

-- CreateIndex
CREATE INDEX "idx_posts_user_id" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "idx_comments_post_id" ON "comments"("post_id");

-- CreateIndex
CREATE INDEX "idx_comments_user_id" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "idx_comments_parent_id" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "idx_reactions_post_id" ON "reactions"("post_id");

-- CreateIndex
CREATE INDEX "idx_reactions_user_id" ON "reactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_post_id_key" ON "reactions"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "idx_comment_reactions_comment_id" ON "comment_reactions"("comment_id");

-- CreateIndex
CREATE INDEX "idx_comment_reactions_user_id" ON "comment_reactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reactions_user_id_comment_id_key" ON "comment_reactions"("user_id", "comment_id");

-- CreateIndex
CREATE INDEX "idx_favorite_books_user_id" ON "favorite_books"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_book" ON "favorite_books"("user_id", "bookId");

-- CreateIndex
CREATE INDEX "idx_relationships_requester" ON "relationships"("requester_id");

-- CreateIndex
CREATE INDEX "idx_relationships_addressee" ON "relationships"("addressee_id");

-- CreateIndex
CREATE INDEX "idx_relationships_status" ON "relationships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "relationships_requester_id_addressee_id_key" ON "relationships"("requester_id", "addressee_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "fk_post_author" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "fk_comment_author" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "fk_comment_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "fk_reaction_author" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "fk_reaction_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "fk_comment_reaction_author" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "fk_comment_reaction_comment" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_books" ADD CONSTRAINT "fk_favorite_user" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "users"("firebase_uid") ON DELETE CASCADE ON UPDATE CASCADE;
