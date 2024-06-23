const pgCore = require("drizzle-orm/pg-core")  

const bytea = pgCore.customType({ 
    dataType() {
      return "bytea"; 
    },
})

export const users = pgCore.pgTable('users', {
    id: pgCore.bigserial('id', { mode: 'number' }).primaryKey(), 
    created_at: pgCore.timestamp('created_at', {withTimezone: true}).defaultNow().notNull(), 
    name: pgCore.text('name').notNull(), 
    email: pgCore.text('email').unique().notNull(), 
    version: pgCore.integer('version').notNull().default(1), 
})

export const files = pgCore.pgTable('files', { 
    file_id: pgCore.bigserial('file_id', { mode: 'number' }).primaryKey(), 
    user_id: pgCore.bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: "cascade" }), 
    filename: pgCore.text('filename').notNull(), 
    metadata: pgCore.text('metadata').notNull(), 
    uploaded_at: pgCore.timestamp('uploaded_at', {withTimezone: true}).notNull().defaultNow(), 
})


export default { 
    users,  
    files, 
    bytea
}