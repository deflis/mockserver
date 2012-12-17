var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs');

receive = function(req, func)
{
    var received = false;
    var data = '';
    req.on('data', function(chunk)
    {
        received = true;
        data += chunk.toString();
    });
    req.on('end', function()
    {
        if (received)
        {
            func(data);
        }
        else
        {
            func(null);
        }
    });
};
writelog = function(req, res, data, status, headers, response_data, file)
{
    var parsed = url.parse(req.url);
    var path = parsed.pathname;
    var query = querystring.parse(parsed.query);
    var post = data != null ? querystring.parse(data) : undefined;
    logdata = {
        request :
            { url : req.url, path: path, method : req.method, headers : req.headers, parsed : parsed, data : data != null ? data.toString() : undefined, querystring: query, post : post },
        response :
            { status : status, headers : headers, data: response_data.toString() , file : file }
    };
    log.push(logdata);
    console.log(logdata);
};
var obj = {
    '/server.js' : null
};
var log = [];


server = http.createServer(function (req, res) {
    var parsed = url.parse(req.url);
    var path = parsed.pathname;
    var query = querystring.parse(parsed.query);
    console.time(path);
    var headers = {'Content-Type': 'text/html'};
    if (path == '/load' && req.method == 'PUT')
    {
        headers = {'Content-Type': 'application/json'};
        receive(req, function(data)
        {
            var status, response_data;
            console.log(data);
            try
            {
                obj = JSON.parse(data);
                status = 200;
                response_data = JSON.stringify({status: 'OK', data : obj});
            }
            catch(e)
            {
                console.log(e);
                status = 500;
                response_data = JSON.stringify({status: 'NG', data : data});
            }
            res.writeHead(status, headers);
            res.end(response_data);
            console.timeEnd(path);
            writelog(req, res, data, status, headers, response_data);
        });
    }
    else if (path == '/load')
    {
        headers = {'Content-Type': 'application/json'};
        receive(req, function(data)
        {
            var post = data != null ? querystring.parse(data) : {};
            var file;
            if(query['file'] !== undefined)
            {
                file = query['file'];
            }
            if(post['file'] !== undefined)
            {
                file = post['file'];
            }
            if(file !== undefined && fs.existsSync(file))
            {
                fs.readFile(file, function(error, _data)
                {
                    if(!error)
                    {
                        try
                        {
                            obj = JSON.parse(_data);
                            status = 200;
                            response_data = JSON.stringify({status: 'OK', data : obj, file: file});
                        }
                        catch(e)
                        {
                            console.log(e);
                            status = 500;
                            response_data = JSON.stringify({status: 'NG', data : _data, file: file});
                        }
                    }
                    else
                    {
                        status = 500;
                        response_data = JSON.stringify({status: 'NG', file: file});
                    }
                    res.writeHead(status, headers);
                    res.end(response_data)
                    console.timeEnd(path);
                    writelog(req, res, data, status, headers, response_data, file);
                });
            }
            else
            {
                if (query['data'] !== undefined || post['data'] !== undefined)
                {
                    var data;
                    if(query['data'] !== undefined)
                    {
                        data = query['data'];
                    }
                    if(post['data'] !== undefined)
                    {
                        data = post['data'];
                    }
                    try
                    {
                        obj = JSON.parse(data);
                        status = 200;
                        response_data = JSON.stringify({status: 'OK', data : obj});
                    }
                    catch(e)
                    {
                        console.log(e);
                        status = 500;
                        response_data = JSON.stringify({status: 'NG', data : data});
                    }
                } else {
                    status = 500;
                    response_data = JSON.stringify({status: 'NG', file: file});
                }
                res.writeHead(status, headers);
                res.end(response_data);
                console.timeEnd(path);
                writelog(req, res, data, status, headers, response_data);
            }
        });
    }
    else if (path == '/log' && (req.method == 'DELETE' || query['_method'] == 'delete'))
    {
        log = [];
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({status:'OK'}));
    }
    else if (path == '/log' && req.method == 'GET')
    {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(log));
    }
    else
    {
        receive(req, function(data)
        {
            if (obj[path] !== undefined)
            {
                var _data = obj[path];
                if (_data == null) {
                    status = 404;
                    response_data = 'null';
                } else if (typeof _data == 'string') {
                    status = 200;
                    response_data = _data;
                } else {
                    if (typeof _data.headers == 'object'){
                        for(var key in _data.headers){
                            headers[key] = _data.headers[key];
                        }
                    }
                    if (_data.status != undefined) {
                        status = _data.status;
                    }
                    response_data = _data.data;
                }
                res.writeHead(status, headers);
                res.end(response_data);
                console.timeEnd(path);
                writelog(req, res, data, status, headers, response_data);
            }
            else
            {
                var file = __dirname + path;
                if (file.substr(-1) == '/')
                {
                    file += 'index.html';
                }

                if(fs.existsSync(file))
                {
                    fs.readFile(file, function(error, response_data) {
                        if(!error) {
                            status = 200;
                        } else {
                            status = 500;
                            response_data = 'file read error';
                        }
                        res.writeHead(status, headers);
                        res.end(response_data);
                        console.timeEnd(path);
                        writelog(req, res, data, status, headers, response_data, file);
                    });
                }
                else
                {
                    status = 404;
                    response_data = 'file not found';
                    res.writeHead(status, headers);
                    res.end(response_data);
                    console.timeEnd(path);
                    writelog(req, res, data, status, headers, response_data, file);
                }
            }
        });
    }
});


console.log('listen');
server.listen(8888);

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.message);
});
