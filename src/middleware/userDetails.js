import validator from 'validator';

import dns from "dns/promises";
const userDetails = async(req, res, next) => {
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

  const domain = email.split('@')[1];
  try{
    const records = await dns.resolveMx(domain);
    if (records.length === 0) {
      return res.status(400).json({ error: 'Email domain does not exist' });
    }
  }catch{
    return res.status(400).json({ error: 'Invalid email domain' });
  }
  email = validator.normalizeEmail(email);

  next();
};

export { userDetails};