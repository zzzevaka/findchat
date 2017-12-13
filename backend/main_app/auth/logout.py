from ..base_handler import BaseHandler


class AuthLogout(BaseHandler):
    
    def get(self):
        self.clear_all_cookies()
        self.session.finish()
        self.redirect('/login')