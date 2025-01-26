const wait = ms => new Promise(res => setTimeout(res, ms));
async function main(){
    oknared.hideBootscreen();
    
    await wait(1000);
    await process.run('/Windows/system32/oobe/msoobe.ore');
    
    return;
}