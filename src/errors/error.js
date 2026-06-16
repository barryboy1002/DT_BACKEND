const errHandler = (error,req,res,next) => {
    console.error("Error: ", error.message)

    const status = error.status || 500;
    const message = error.message || "Internal Server Error";

    res.status(status).json({success: false, error : message});

}
export {errHandler}