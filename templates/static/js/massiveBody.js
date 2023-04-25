export { massiveBody };
class massiveBody {
    //Variable Naming Key:
    //Ex.
    //G --> Graviational constant coefficient
    //Ge -->Gravitational constant expoential (base 10)
    // Gravitational constant = 6.6743e-11
    // G = 6.6743;
    // Ge = -11;
    
    //Preset variables (these don't change after the constructor is called)
    G = 6.6743;
    Ge = -11;
    M = 0;
    Me = 0;
    dt = 2.16; //Time change between position and velocity iterations in seconds
    dte = 4; //Time change modifier: dt = 21600 (2.16e4)

    AU = 1.4959; //Distance from Earth to Sun (Astronomical Unit) = 1.4959e11 meters
    AUe = 11;
    EV = 3.0290; //Earth Velocity (Astronomical Units) = 30,290 m/s
    EVe = 4;

    Name = ""; //Name of body
    clicked = false; //Is the body selected? //might not need
    Zoom = false;//Is the camera currently zoomed to this planet
    TraceOrbit = false;

    X = 0; //X position
    Xe = 0;
    Y = 0; //Y position
    Ye = 0;
    VX = 0; //X Velocity
    VXe = 0;
    VY = 0; //Y velocity
    VYe = 0;
    GX = 0; //X Gravitational Acceleration
    GXe = 0;
    GY = 0; //Y Gravitational Acceleration
    GYe = 0;

    XAdj = 0; //X in terms of Astronomical Units
    YAdj = 0; //Y in terms of Astronomical Units
    VXAdj = 0; //VX in terms of Astronomical Units
    VYAdj = 0; //VY in terms of Astronomical Units

    VCalc = 0; //Calculated velocity to yeild a stable orbit given X and Y
    VeCalc = 0;
    VXCalc = 0;
    VXeCalc = 0;
    VYCalc = 0;
    VYeCalc = 0;
    userVXCalc = 0;
    userVYCalc = 0;

    constructor(Name, X, Xe, Y, Ye, VX, VXe, VY, VYe, M, Me) {
        this.Name = Name;

        this.X = X;
        this.Xe = Xe;
        this.Y = Y;
        this.Ye = Ye;
        this.VX = VX;
        this.VXe = VXe;
        this.VY = VY;
        this.VYe = VYe;

        this.M = M;
        this.Me = Me;

        this.XAdj = (this.X/this.AU)*10**(this.Xe-this.AUe);
        this.YAdj = (this.Y/this.AU)*10**(this.Ye-this.AUe);

        this.VXAdj = (this.VX/this.EV)*10**(this.VXe-this.EVe);
        this.VYAdj = (this.VY/this.EV)*10**(this.VYe-this.EVe);

        // var radiusAdj = Math.sqrt(this.XAdj**2+this.YAdj**2);
        // var R = (this.X/this.XAdj)*radiusAdj;
        // var Re = this.Xe;
        // this.VCalc = Math.sqrt((this.G*this.M)/R);
        // this.VeCalc = (this.Ge+this.Me-Re)*0.5;
        // this.VCalc = this.VCalc*10**(this.VeCalc);

        var GXtemp = this.GravAccX();
        this.GX = GXtemp[0];
        this.GXe = GXtemp[1];
        var n = this.normalize(this.GX, this.GXe);
        this.GX = n[0];
        this.GXe = n[1];

        var GYtemp = this.GravAccY();
        this.GY = GYtemp[0];
        this.GYe = GYtemp[1];
        n = this.normalize(this.GY, this.GYe);
        this.GY = n[0];
        this.GYe = n[1];
    }

    calcParams(){
        const tempGx = this.GX;
        const tempGXe = this.GXe;
        const tempGy = this.GY;
        const tempGYe = this.GYe;
    
        const tempVx = this.VX;
        const tempVXe = this.VXe;
        const tempVy = this.VY; 
        const tempVYe = this.VYe;

        //Calculate Velocity...
        //Formula:
        //Vf = Vi + a*dt

        var VXfsum = this.addSciNot(this.VX, (tempGx*this.dt), this.VXe, (tempGXe+this.dte));
        this.VX = VXfsum[0];
        this.VXe = VXfsum[1];

        //And again with y...

        var VYfsum = this.addSciNot(this.VY, (tempGy*this.dt), this.VYe, (tempGYe+this.dte));
        this.VY = VYfsum[0];
        this.VYe = VYfsum[1];
        
        //Calculate Position...
        //Formula:
        //Xf = Xi + ((Vf + Vi)/2)*dt + (1/2)*a*dt^2 or Yf = Yi + ((Vf + Vi)/2)*dt + (1/2)*a*dt^2
        
        //Average previous and current velocity...
        var VelocityAvgSum = this.addSciNot(this.VX, tempVx, this.VXe, tempVXe);

        var PositionSum1 = this.addSciNot(this.X, (VelocityAvgSum[0]*0.5*this.dt), this.Xe, (VelocityAvgSum[1]+this.dte));
        var PositionSum2 = this.addSciNot(PositionSum1[0], (0.5*tempGx*this.dt**2), PositionSum1[1], (tempGXe+this.dte*2));

        this.X = PositionSum2[0];
        this.Xe = PositionSum2[1];

        var n = this.normalize(this.X, this.Xe);
        this.X = n[0];
        this.Xe = n[1];

        this.XAdj = (this.X/this.AU)*10**(this.Xe-this.AUe);

        // //And again with y...

        // //Average previous and current velocity...
        VelocityAvgSum = this.addSciNot(this.VY, tempVy, this.VYe, tempVYe);

        PositionSum1 = this.addSciNot(this.Y, (VelocityAvgSum[0]*0.5*this.dt), this.Ye, (VelocityAvgSum[1]+this.dte));
        PositionSum2 = this.addSciNot(PositionSum1[0], (0.5*tempGy*this.dt**2), PositionSum1[1], (tempGYe+this.dte*2));

        this.Y = PositionSum2[0];
        this.Ye = PositionSum2[1];

        n = this.normalize(this.Y, this.Ye);
        this.Y = n[0];
        this.Ye = n[1];

        this.YAdj = (this.Y/this.AU)*10**(this.Ye-this.AUe);

        //g(x) = (-G*M*x)/((x^2+y^2)^(3/2))

        var GXtemp = this.GravAccX();
        this.GX = GXtemp[0];
        this.GXe = GXtemp[1];
        // var n = this.normalize(this.GX, this.GXe);
        // this.GX = n[0];
        // this.GXe = n[1];

        var GYtemp = this.GravAccY();
        this.GY = GYtemp[0];
        this.GYe = GYtemp[1];
        // n = this.normalize(this.GY, this.GYe);
        // this.GY = n[0];
        // this.GYe = n[1];
    }
    //New algorithm for gx and gy
    GravAccX() {
        if(this.X == 0)
            return [0,0];
        else{
            const top = (-this.G*this.M*this.X);
            var factor = Math.max(this.Xe*2, this.Ye*2);
            const bottom = (this.X**2*10**(this.Xe*2-factor) + this.Y**2*10**(this.Ye*2-factor))**1.5;

            return [top/bottom, ((this.Ge+this.Me+this.Xe) - (factor*1.5))];
        }
    }
    GravAccY() {
        if(this.Y == 0)
            return [0,0];
        else{
            const top = (-this.G*this.M*this.Y);
            var factor = Math.max(this.Xe*2, this.Ye*2);
            const bottom = (this.X**2*10**(this.Xe*2-factor) + this.Y**2*10**(this.Ye*2-factor))**1.5;
           
            return [top/bottom, ((this.Ge+this.Me+this.Ye) - (factor*1.5))];
        }
    }
    addSciNot(num1, num2, exp1, exp2){
        var factor = Math.max(exp1, exp2);
        return [(num1*10**(exp1-factor) + num2*10**(exp2-factor)), factor];
    }
    normalize(num, exp){
        while(Math.abs(num) < 1 && num != 0){
            num = num*10;
            exp--;
        }
        while(Math.abs(num) >= 10 && num != 0){
            num = num/10;
            exp++;
        }
        return [num, exp];
    }
    get Name(){
        return this.Name;
    }
    get Zoom(){
        return this.Zoom;
    }
    get XAdj(){
        return this.XAdj;
    }
    get YAdj(){
        return this.YAdj;
    }
    get VCalc(){
        return this.VCalc;
    }
    get VeCalc(){
        return this.VeCalc;
    }
    get X(){
        return this.X;
    }
    get Xe(){
        return this.Xe;
    }
    get Y() {
        return this.Y;
    }
    get Ye() {
        return this.Ye;
    }
    get VX() {
        return this.VX
    }
    get VXe() {
        return this.VXe;
    }
    get VY(){
        return this.VY;
    }
    get VYe (){
        return this.VYe;
    }
    get GX(){
        return this.GX;
    }
    get GXe(){
        return this.GXe;
    }
    get GY(){
        return this.GY;
    }
    get GYe(){
        return this.GYe;
    }
    get Parameters(){
        return [X, Xe, Y, Ye, VX, VXe, VY, VYe];
    }
    set X(n){
        X = n;
        return;
    }
    set Xe(n){
        Xe = n;
        return;
    }
    set VXe(n){
        VXe = n;
        return;
    }
    set VYe(n){
        VYe = n;
        return;
    }
    setX(n){
        this.X = n;
        this.XAdj = (this.X/this.AU)*10**(this.Xe-this.AUe);

        if(this.XAdj == 0 && this.YAdj == 0){
            this.VCalc = 0;
            this.VeCalc = 0;
            this.VXCalc = this.VCalc;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            return;
        }
        else if(this.XAdj == 0){
            var R = this.Y;
            var Re = this.Ye;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.YAdj) == -1)
                this.VXCalc = this.VCalc;
            else
                this.VXCalc = this.VCalc*-1;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = 0;
            this.VYeCalc = 0;
        }
        else if(this.YAdj == 0){
            var R = this.X;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.XAdj) == -1)
                this.VYCalc = this.VCalc*-1;
            else
                this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            this.VXCalc = 0;
            this.VXeCalc = 0;
        }
        else {
            var radiusAdj = Math.sqrt(this.XAdj**2+this.YAdj**2);
            var R = (this.X/this.XAdj)*radiusAdj;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;
            console.log(this.VCalc*10**this.VeCalc);
            if(this.XAdj > this.YAdj){
                this.VXCalc = Math.sin((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VYCalc = Math.cos((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }
            else{
                this.VXCalc = Math.cos((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VYCalc = Math.sin((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }

            if(Math.sign(this.XAdj) == Math.sign(this.YAdj)){
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj)*-1;
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
            else{
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj);
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
        }

        this.userVXCalc = this.VXCalc*10**this.VXeCalc;
        this.userVYCalc = this.VYCalc*10**this.VYeCalc;

        //console.log("XAdj: " + this.XAdj + " YAdj: " + this.YAdj + " VCalc: " + this.VCalc + " VeCalc: " + this.VeCalc + " VXCalc: " + this.VXCalc + " VXeCalc: " + this.VXeCalc + " VYCalc: " + this.VYCalc + " VYeCalc: " + this.VYeCalc);
    }
    setXe(n){
        this.Xe = n;
        this.XAdj = (this.X/this.AU)*10**(this.Xe-this.AUe);

        if(this.XAdj == 0 && this.YAdj == 0){
            this.VCalc = 0;
            this.VeCalc = 0;
            this.VXCalc = this.VCalc;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            return;
        }
        else if(this.XAdj == 0){
            var R = this.Y;
            var Re = this.Ye;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.YAdj) == -1)
                this.VXCalc = this.VCalc;
            else
                this.VXCalc = this.VCalc*-1;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = 0;
            this.VYeCalc = 0;
        }
        else if(this.YAdj == 0){
            var R = this.X;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.XAdj) == -1)
                this.VYCalc = this.VCalc*-1;
            else
                this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            this.VXCalc = 0;
            this.VXeCalc = 0;
        }
        else {
            var radiusAdj = Math.sqrt(this.XAdj**2+this.YAdj**2);
            var R = (this.X/this.XAdj)*radiusAdj;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;
            console.log(this.VCalc*10**this.VeCalc);
            if(this.XAdj > this.YAdj){
                this.VXCalc = Math.sin((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VYCalc = Math.cos((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }
            else{
                this.VXCalc = Math.cos((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VYCalc = Math.sin((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }

            if(Math.sign(this.XAdj) == Math.sign(this.YAdj)){
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj)*-1;
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
            else{
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj);
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
        }

        this.userVXCalc = this.VXCalc*10**this.VXeCalc;
        this.userVYCalc = this.VYCalc*10**this.VYeCalc;
    }
    setY(n){
        this.Y = n;
        this.YAdj = (this.Y/this.AU)*10**(this.Ye-this.AUe);

        if(this.XAdj == 0 && this.YAdj == 0){
            this.VCalc = 0;
            this.VeCalc = 0;
            this.VXCalc = this.VCalc;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            return;
        }
        else if(this.XAdj == 0){
            console.log("X = 0");
            var R = this.Y;
            var Re = this.Ye;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            console.log(this.VCalc);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.YAdj) == -1)
                this.VXCalc = this.VCalc;
            else
                this.VXCalc = this.VCalc*-1;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = 0;
            this.VYeCalc = 0;
        }
        else if(this.YAdj == 0){
            var R = this.X;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.XAdj) == -1)
                this.VYCalc = this.VCalc*-1;
            else
                this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            this.VXCalc = 0;
            this.VXeCalc = 0;
        }
        else {
            var radiusAdj = Math.sqrt(this.XAdj**2+this.YAdj**2);
            var R = (this.X/this.XAdj)*radiusAdj;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;
            console.log(this.VCalc*10**this.VeCalc);
            if(this.XAdj > this.YAdj){
                this.VXCalc = Math.sin((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VYCalc = Math.cos((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }
            else{
                this.VXCalc = Math.cos((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VYCalc = Math.sin((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }

            if(Math.sign(this.XAdj) == Math.sign(this.YAdj)){
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj)*-1;
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
            else{
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj);
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
        }

        this.userVXCalc = this.VXCalc*10**this.VXeCalc;
        this.userVYCalc = this.VYCalc*10**this.VYeCalc;
    }
    setYe(n){
        this.Ye = n;
        this.YAdj = (this.Y/this.AU)*10**(this.Ye-this.AUe);

        if(this.XAdj == 0 && this.YAdj == 0){
            this.VCalc = 0;
            this.VeCalc = 0;
            this.VXCalc = this.VCalc;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            return;
        }
        else if(this.XAdj == 0){
            var R = this.Y;
            var Re = this.Ye;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.YAdj) == -1)
                this.VXCalc = this.VCalc;
            else
                this.VXCalc = this.VCalc*-1;
            this.VXeCalc = this.VeCalc;
            this.VYCalc = 0;
            this.VYeCalc = 0;
        }
        else if(this.YAdj == 0){
            var R = this.X;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;

            if(Math.sign(this.XAdj) == -1)
                this.VYCalc = this.VCalc*-1;
            else
                this.VYCalc = this.VCalc;
            this.VYeCalc = this.VeCalc;
            this.VXCalc = 0;
            this.VXeCalc = 0;
        }
        else {
            var radiusAdj = Math.sqrt(this.XAdj**2+this.YAdj**2);
            var R = (this.X/this.XAdj)*radiusAdj;
            var Re = this.Xe;
            this.VCalc = Math.sqrt((this.G*this.M)/R);
            this.VeCalc = (this.Ge+this.Me-Re)*0.5;
            console.log(this.VCalc*10**this.VeCalc);
            if(this.XAdj > this.YAdj){
                this.VXCalc = Math.sin((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VYCalc = Math.cos((Math.PI/2)-Math.atan(this.XAdj/this.YAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }
            else{
                this.VXCalc = Math.cos((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VYCalc = Math.sin((Math.PI/2)-Math.atan(this.YAdj/this.XAdj))*this.VCalc;
                this.VXeCalc = this.VeCalc;
                this.VYeCalc = this.VeCalc;
            }

            if(Math.sign(this.XAdj) == Math.sign(this.YAdj)){
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj)*-1;
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
            else{
                this.VXCalc = Math.abs(this.VXCalc)*Math.sign(this.XAdj);
                this.VYCalc = Math.abs(this.VYCalc)*Math.sign(this.XAdj);
            }
        }

        this.userVXCalc = this.VXCalc*10**this.VXeCalc;
        this.userVYCalc = this.VYCalc*10**this.VYeCalc;
    }
    setVX(n){
        this.VX = n;
        this.VXAdj = (this.VX/this.EV)*10**(this.VXe-this.EVe);
    }
    setVXe(n){
        this.VXe = n;
        this.VXAdj = (this.VX/this.EV)*10**(this.VXe-this.EVe);

    }
    setVY(n){
        this.VY = n;
        this.VYAdj = (this.VY/this.EV)*10**(this.VYe-this.EVe);
    }
    setVYe(n){
        this.VYe = n;
        this.VYAdj = (this.VY/this.EV)*10**(this.VYe-this.EVe);
    }
}