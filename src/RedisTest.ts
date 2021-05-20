import redis from "redis";

var client = redis.createClient();

client.multi().set('foo', 'bar').set('set', 'a', (err, replay)=>
{
    
}).exec((err, replies)=>{
    console.log(replies);
});

let pub = redis.createClient();
let sub = redis.createClient();

sub.subscribe('chat');

sub.on('message', (channel, message)=>{
    console.log(`收到${channel}频道的消息${message}`);
});

sub.on('subscribe', (channel, count)=>{
    pub.publish('chat', 'hi');
});

async function * test1()
{
    for (let i:number = 0; i < 100; i++)
    {
        yield i;
    }
}

async function test2()
{
    for await (let a of test1())
    {
        console.log(a);
    }
    // return new Promise<number>((resolve, reject)=>{
    //     setTimeout(() => 
    //     {
    //         resolve(100);
    //     }, 1000);
    // })
}

// let a = test1();
// let b = test1();

console.log('start');

test2();

console.log('end');
