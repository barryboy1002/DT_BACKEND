import { query, getClient } from "../db/index.js";
import bcrypt from 'bcrypt';
import {AppError} from '../errors/AppError.js'
import { signToken } from "../utils/jwt.js";

async function registerUserService(data){
    const {businessId,
        name,
        email,
        password,
        role,
        branchId} =  data;
    const existing = await query("SELECT user_id from users WHERE email= $1 AND business_id = $2",[email, businessId])
    if(existing.rowCount > 0){
        throw new AppError("Email Already Exists",409);
    }

    const hashPassword = await bcrypt.hash(password,10);

    const result = await query(`
        INSERT INTO Users (
        business_id,
        name,
        email,
        password_hash,
        role,
        branch_id)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING 
        user_id,
        business_id,
        name,
        email,
        role,
        branch_id`,
    [
    businessId,
    name,
    email,
    hashPassword,
    role,
    branchId
    ])

    return result.rows[0];
    

}

async function registerBusinessOwnerService(data){
    const {
    businessName,
    plan,
    phone ,
    name,
    email,
    password
    } = data;
    // Use the same email for both business and user
    const businessEmail = email;
    const client = await getClient();
    try{

        await client.query("BEGIN");
        const existingBusiness = await client.query(
        `
        SELECT business_id
        FROM businesses
        WHERE email = $1
        `,
        [businessEmail]
        );

        if (existingBusiness.rowCount > 0) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const BusinessResult = await client.query(
            `INSERT INTO businesses(name,ac_status,phone,email) 
            VALUES($1,$2,$3,$4) RETURNING business_id`,[businessName,plan,phone,businessEmail]
        )
        const businessId = BusinessResult.rows[0].business_id;
        
        

        const passwordHash = await bcrypt.hash(password,10);
        const userResult = await client.query(
            `
            INSERT INTO users(
                business_id,
                name,
                email,
                password_hash,
                role
            )
            VALUES($1,$2,$3,$4,$5)
            RETURNING
                user_id,
                business_id,
                name,
                email,
                role
            `,
            [
                businessId,
                name,
                email,
                passwordHash,
                "owner"
            ]
            );
        await client.query("COMMIT");
        
        const user = userResult.rows[0];
        const token = signToken({
            userId: user.user_id,
            businessId: user.business_id,
            role: user.role
        });
        
        return {
            token,
            user: {
                user_id: user.user_id,
                business_id: user.business_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }catch(error){
        await client.query('ROLLBACK');
        throw error;
    }finally{
        client.release();
    }

    

}

async function loginUserService(email, password){
    const result = await query("SELECT user_id, business_id, name, email, password_hash, role, branch_id FROM users WHERE email=$1", [email]);
    if(result.rowCount  === 0){
        throw new AppError("Invalid User Credentials", 401)
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password,user.password_hash);

    if(!isMatch){
        throw new AppError("Invalid User Credentials", 401);
    }

    const token = signToken({
        userId:user.user_id,
        businessId: user.business_id,
        role:user.role,
        branchId: user.branch_id
    })
    return {
        token,
        user: {
            user_id: user.user_id,
            business_id: user.business_id,
            name: user.name,
            email: user.email,
            role: user.role,
            branch_id: user.branch_id
        }
    };

}


async function getCurrentUserService(userId) {
    const result = await query(
        `
        SELECT
            user_id,
            business_id,
            name,
            email,
            role,
            branch_id
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    if (result.rowCount === 0) {
        throw new NotFoundError("User not found");
    }

    return result.rows[0];
}

async function listUsersService(businessId) {
    const result = await query(
        `SELECT u.user_id, u.business_id, u.name, u.email, u.role, u.branch_id, b.name AS branch_name, u.created_at
         FROM users u
         LEFT JOIN branches b ON u.branch_id = b.branch_id
         WHERE u.business_id = $1
         ORDER BY u.created_at DESC`,
        [businessId]
    );
    return result.rows;
}


export {getCurrentUserService,registerUserService,registerBusinessOwnerService,loginUserService,listUsersService }