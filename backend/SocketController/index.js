module.exports = (io) => {
    console.log('Real-time connection estabilished');


    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);


        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });

    });

    io.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });

    io.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });
}
