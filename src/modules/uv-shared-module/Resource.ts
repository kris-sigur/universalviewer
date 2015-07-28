import IProvider = require("./IProvider");
import Storage = require("./Storage");

class Resource implements Manifesto.IResource {
    public data: any;
    public dataUri: string;
    public error: any;
    public isAccessControlled: boolean = false;
    public loginService: string;
    public logoutService: string;
    public provider: IProvider;
    public status: number;
    public tokenService: string;

    constructor(provider: IProvider) {
        this.provider = provider;
    }

    private _parseAuthServices(resource: any): void {

        var loginService: Manifesto.IService = this.provider.getService(resource, manifesto.ServiceProfile.login().toString());
        if (loginService) this.loginService = loginService.id;

        var logoutService: Manifesto.IService = this.provider.getService(resource, manifesto.ServiceProfile.logout().toString());
        if (logoutService) this.logoutService = logoutService.id;

        var tokenService: Manifesto.IService = this.provider.getService(resource, manifesto.ServiceProfile.token().toString());
        if (tokenService) this.tokenService = tokenService.id;

        if (this.loginService) this.isAccessControlled = true;
    }

    public getData(accessToken?: Manifesto.IAccessToken): Promise<Resource> {
        var that = this;

        return new Promise<Resource>((resolve, reject) => {

            $.ajax(<JQueryAjaxSettings>{
                url: that.dataUri,
                type: 'GET',
                dataType: 'json',
                beforeSend: (xhr) => {
                    if (accessToken){
                        xhr.setRequestHeader("Authorization", "Bearer " + accessToken.accessToken);
                    }
                }
            }).done((data) => {
                that.status = 200;
                that.data = data;
                that._parseAuthServices(that.data);
                resolve(that);
            }).fail((error) => {
                that.status = error.status;
                that.error = error;
                if (error.responseJSON){
                    that._parseAuthServices(error.responseJSON);
                }
                resolve(that);
            });
        });
    }
}

export = Resource;