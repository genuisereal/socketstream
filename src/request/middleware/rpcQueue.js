var queue = []

exports.decorate = decorate  

function decorate(action)
{
	return function (req, res, cb)	{

		var myRes = function ()
		{	
			console.log("BeforeSystemRes")
			cb.apply(null, arguments)
			console.log("AfterSystemRes")

			queue.shift()
			if (queue.length != 0)
			{
				console.log("Queue.shift", queue.length)
				action.apply(null, queue[0])	
			}

		}	

		queue.push([req, res, myRes])
		if (queue.length == 1)
		{
			action(req, res, myRes)
		}
		else
		{
			console.log("Queue.push", queue.length)
		}
	}
}
