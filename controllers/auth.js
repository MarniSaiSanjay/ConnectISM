module.exports.login_get = (req,res) => {
    res.render('auth/login');
}

module.exports.logout = (req, res) => {
    req.logOut();
    req.flash('success', 'Bye');
    res.redirect('/users/login');
};

