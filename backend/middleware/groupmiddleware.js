const isGroupMember = async (req, res, next) => {
    const group = await Group.findById(req.body.groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You do not have permission to access this group chat' });
    }
    next();
  };
  
  module.exports = {
    isGroupMember
  }