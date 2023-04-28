const PORT = process.env.PORT || 3700;
const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3500',
      'http://127.0.0.1:5500',
      'https://witwater.vercel.app'
];

const io = require( 'socket.io' )( PORT, {
      cors: {
            origin: allowedOrigins
      }
})

let users = []

const addUser = ( userId, socketId ) =>
{
      !users.some( user => user.userId === userId ) && 
            users.push({userId, socketId})
}

const removeUser = ( socketId ) =>
{
      users = users.filter(user => user.socketId !== socketId)
}

const getUser = ( userId ) =>
{
      return users.find(user=> user.userId === userId)
}

io.on( 'connection', ( socket ) =>
{
      // when connected
      console.log( 'a user connected' )
      socket.on( "addUser", userId =>
      {
            addUser( userId, socket.id );
            io.emit( 'getUsers', users )
      } )

      //send and get message
      socket.on( 'sendMessage', ( { senderId, receiverId, text } ) =>
      {
            const user = getUser( receiverId );
            io.to( user.socketId ).emit( 'getMessage', {
                  senderId, text
            })
      })

      //when disconnected
      socket.on( 'disconnet', () =>
      {
            console.log( 'a user disconnected' );
            removeUser( socket.id )
            io.emit( 'getUsers', users );
      })
} );

module.exports = io;