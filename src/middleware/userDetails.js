import validator from 'validator';

const userDetails = (req, res, next) => {
  const { email, name,businessName,phone } = req.body;

  if (!email || !name || !businessName || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!validator.isLength(name, { min: 2, max: 100 })) {
    return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
  }

  if (!validator.isLength(businessName, { min: 2, max: 100 })) {
    return res.status(400).json({ error: 'Business name must be between 2 and 100 characters' });
  }
  if(!validator.isLength(phone, { min: 10, max: 15 })){
    return res.status(400).json({ error: 'Phone number must be between 10 and 15 characters' });
  }

  next();
};

export default userDetails;