const GoogleUser = require('../models/googleuser');
const { isLoggedIn, isAuthor, isAdmin, catchAsyncError } = require('../middleware');

module.exports.addFollowingGet = async (req,res) => {
    const users = await GoogleUser.find();
    res.render('general/addFollowing', {users});
};

module.exports.addPost = async(req,res)=> {
    const {c_id, f_id} = req.params;
    if(req.user.id === c_id && c_id != f_id){
        const user = await GoogleUser.findById(c_id);
        const f_user = await GoogleUser.findById(f_id);
        if(f_user === null){
            req.flash('error', 'User not found!!');
            return res.redirect('/home');
        }
            if(user.following.length>0){
                for(let i of user.following){
                    if(i == f_id){
                        req.flash('error', 'Already Following');
                        return res.redirect(`/friends/addFollowing`);
                    }
                }
            }

        user.following.push(f_id);
        await user.save();
        if(req.query.move == undefined) return res.redirect(`/friends/addFollowing`);
        else if(req.query.move === 'profile') return res.redirect(`/friends/view/${f_id}`);
        else{
            req.flash('error', 'Please login again');
            req.logOut();
            res.redirect('/users/login');
        }
    }else{
        req.flash('error', 'Please login again');
        req.logOut();
        res.redirect('/users/login');
    }
};

module.exports.removePost = async(req,res) => {
    const {c_id, f_id} = req.params;
    if(req.user.id === c_id && c_id != f_id){
        await GoogleUser.findByIdAndUpdate(c_id, {$pull: {following: f_id}}); 
        if(req.query.move == undefined) return res.redirect('/friends/addFollowing');
        else if(req.query.move === 'profile') return res.redirect(`/friends/view/${f_id}`);
        else {
            req.flash('error', 'Please login again');
            req.logOut();
            res.redirect('/users/login');
        }
    }else {
        req.flash('error', 'Please login again');
        req.logOut();
        res.redirect('/users/login');
    }
};

module.exports.viewPro = async(req,res)=>{
    const {f_id}=req.params;
    const user = await GoogleUser.findById(f_id);
    if(user){
        res.render('general/profile', {user});
    }else{
        req.flash('error','User not found');
        res.redirect('/home');
    }
};
