import { Component/*, NgZone*/ } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { ServerProvider } from '../../providers/server'
import { ServerModel } from '../../models/server.model'


/*
  Generated class for the SelectServer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-select-server',
  templateUrl: 'select-server.html'
})
export class SelectServerPage {
  public servers: ServerModel;
  public selectedServer: ServerModel;
  public foundServers: ServerModel[] = [];

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private serverProvider: ServerProvider
   /*, private zone: NgZone*/) {
    viewCtrl.willLeave.subscribe(() => {
      this.serverProvider.unwatch();
    })
  }

  onServerSelected(server) {
    this.serverProvider.saveAsDefault(server);
  }

  addManually() {
    let alert = this.alertCtrl.create({
      title: 'Add manually',
      inputs: [{
        name: 'name',
        placeholder: 'Name (optional)'
      }, {
        name: 'address',
        placeholder: 'Address (eg: 192.168.0.123)',
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        text: 'Add',
        handler: data => { }
      }]
    });
    alert.present();
  }

  ionViewDidLoad() {
    this.scanForServers();

    this.serverProvider.getDefaultServer().then(
      (defaultServer: ServerModel) => {
        let server = this.foundServers.find(x => x.address === defaultServer.address);
        if (server) { // se è già dentro foundServers
          this.selectedServer = server; // lo seleziono
        } else { // se non è dentro foundServers
          this.foundServers.push(defaultServer); // lo aggiungo
          this.selectedServer = defaultServer;
        }
        console.log(defaultServer)
      },
      err => { }
    );
  }

  scanForServers() {
    this.serverProvider.unwatch();
    this.serverProvider.watchForServers().subscribe((server: ServerModel) => {
      let alreadyPresent = this.foundServers.filter(x => x.address == server.address).length;
      if (!alreadyPresent) {
        this.foundServers.push(server)
      }
    });

    setTimeout(() => {
      if (this.foundServers.length == 0) {
        let alert = this.alertCtrl.create({
          title: "Unable to connect",
          message: 'Is the server runnig on your computer?',
          buttons: [{
            text: 'Offline mode',
            role: 'cancel',
            handler: () => {
              this.navCtrl.pop();
            }
          }, {
            text: 'Try again',
            handler: () => this.scanForServers()
          }]
        });
        alert.present();
      }
    }, 10 * 1000)
  } // scan

}