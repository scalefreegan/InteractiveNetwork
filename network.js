var isb;
if (!isb) {
    isb = {};
}

(function() {

    function AddEdgeNode1Mode(editor) {
        this.handleClick = function(x, y) {
            if (editor.CreateMode == 'Edge') {
                var node = editor.findNodeAt(x, y);
                if (node !== null) {
                    startNode = node;
                    editor.enterSetTargetNodeMode();
                }
            }
        };
        this.onEnter = function() {
            $('<span id="message1">Select start node</span>').replaceAll('#message1');
        };
    }

    function AddEdgeNode2Mode(editor) {
        this.handleClick = function (x, y) {
            if (editor.CreateMode == 'Edge') {
                var node = editor.findNodeAt(x, y);
                if (node != null && node != startNode) {
                    // create an edge
                    editor.makeEdge(startNode, node);
                    editor.enterSetStartNodeMode();
                }
            }
        };
        this.onEnter = function() {
            $('<span id="message1">Select end node</span>').replaceAll('#message1');
        };
    }
    
    function AddNode(editor) {
        this.handleClick = function (x, y) {
            if (editor.CreateMode == 'Node') {
                editor.drawNodes(x,y,editor.NodeRadius);
            }
        };
        this.onEnter = function() {
            $('<span id="message1">Add node</span>').replaceAll('#message1');
        };

    }

    function Edge(canvas, from, to, width, color) {
        function rad2deg(angle) { return angle * 180 / Math.PI; }
        function deg2rad(angle) { return angle * Math.PI / 180; }
        var tri = null;
        function drawTriangle(x0, y0, x1, y1, x2, y2, angle) {
            var pathString = 'M ' + x0 + ' ' + y0 + ' L ' + x1 + ' ' + y1 +
                ' L ' + x2 + ' ' + y2 + ' Z';
            if (tri == null) {
                tri = canvas.path(pathString);
                tri.attr('fill', '#000');
            } else {
                tri.attr('path', pathString);
            }
            tri.rotate(angle, x0, y0);
        }

        // Works well when x1 >= x0
        function drawTriangleRight(x0, y0, angle) {
            var x1 = x0 - 10, y1 = y0 + 5;
            var x2 = x0 - 10, y2 = y0 - 5;
            drawTriangle(x0, y0, x1, y1, x2, y2, angle);
        }
        // Works well when x1 < x0
        function drawTriangleLeft(x0, y0, angle) {
            var x1 = x0 + 10, y1 = y0 - 5;
            var x2 = x0 + 10, y2 = y0 + 5;
            drawTriangle(x0, y0, x1, y1, x2, y2, angle);
        }

        function intersectLineAndCircle(x1, y1, x2, y2, cx, cy, r, m) {
            // intersection point when circle is at (0, 0)
            var ix = (x2 < x1) ? r / Math.sqrt(m * m + 1) : r / -Math.sqrt(m * m + 1);
            var iy = m * ix;
            // translate by (center_to)
            ix += cx;
            iy += cy;
            return {x: ix, y: iy};
        }

        var edgegfx = null;
        this.update = function() {
            var x0 = from.attr('cx'), y0 = from.attr('cy'), r0 = from.attr('r');
            var x1 = to.attr('cx'), y1 = to.attr('cy'), r1 = to.attr('r');
            var m = (y1 - y0) / (x1 - x0); // calculate slope m
            var inter_to = intersectLineAndCircle(x0, y0, x1, y1, x1, y1, r1, m);
            var inter_from = intersectLineAndCircle(x1, y1, x0, y0, x0, y0, r0, m);

            pathString =  'M ' + inter_from.x + ' ' + inter_from.y + ' L ' +
                inter_to.x + ' ' + inter_to.y;

            if (edgegfx == null) {
                edgegfx = canvas.path(pathString);
                edgegfx.attr('stroke-width', width);
                edgegfx.attr('stroke', color);
                edgegfx.attr('stroke-dasharray', "-");
            } else {
                edgegfx.attr('path', pathString);
            }
            var theta = rad2deg(Math.atan(m));
            if (x1 >= x0) drawTriangleRight(inter_to.x, inter_to.y, theta);
            else drawTriangleLeft(inter_to.x, inter_to.y, theta);
        }
        this.update();
    }

    function Editor(canvas) {
        var nodes = [];
        var edges = [];
        var addEdgeNode1Mode = new AddEdgeNode1Mode(this);
        var addEdgeNode2Mode = new AddEdgeNode2Mode(this);
        var editMode = null;
        this.nodeAt = function(i) { return nodes[i]; };
        
        this.CreateMode = 'Node';
        this.NodeRadius = 30;

        function addNode(x, y, r) {
            var nodegfx = canvas.circle(x, y, r);
            nodegfx.attr("stroke", "#00f");
            nodegfx.attr("fill", "#0f0");
            nodes[nodes.length] = nodegfx;
        }
        
        function nodeContains(node, x, y) {
            var r = node.attr('r');
            var dia = r * 2;
            var x0 = node.attr('cx') - r;
            var y0 = node.attr('cy') - r;
            return x >= x0 && x < x0 + dia && y >= y0 && y <= y0 + dia;
        }
        function changeEditMode(mode) {
            editMode = mode;
            mode.onEnter();
        }

        this.findNodeAt = function(x, y) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (nodeContains(node, x, y)) {
                    node.attr('fill', '#f00');
                    return node;
                }
            }
            return null;
        }
        this.updateEdges = function() {
            for (var i = 0; i < edges.length; i++) {
                edges[i].update();
            }
        };
        this.drawNodes = function(nodeDefs) {
            for (var i = 0; i < nodeDefs.length; i++) {
                addNode(nodeDefs[i].x, nodeDefs[i].y, nodeDefs[i].r);
            }
        };
        this.edgeStrokeWidth = 3;
        this.edgeStrokeColor = '#000';

        this.makeEdge = function(from, to) {
            edges[edges.length] = new Edge(canvas, from, to,
                                           this.edgeStrokeWidth, this.edgeStrokeColor);
            for (var j = 0; j < nodes.length; j++) {
                var n = nodes[j];
                n.attr('fill', '#0f0');
            }
        };

        this.handleClick = function(x, y) {
            editMode.handleClick(x, y);
        };
        this.enterSetTargetNodeMode = function() {
            changeEditMode(addEdgeNode2Mode);
        };
        this.enterSetStartNodeMode = function() {
            changeEditMode(addEdgeNode1Mode);
        };

        // Setup logic here
        changeEditMode(addEdgeNode1Mode);
    };

    isb.editor = null;

    // Event handlers
    isb.canvasMouseMove = function (event) {
        var x = event.pageX - this.offsetLeft;
        var y = event.pageY - this.offsetTop;
        $('<span id="mousex">' + x + '</span>').replaceAll('#mousex');
        $('<span id="mousey">' + y + '</span>').replaceAll('#mousey');
    };
    isb.canvasClick = function(event) {
        var x = event.pageX - this.offsetLeft;
        var y = event.pageY - this.offsetTop;
        isb.editor.handleClick(x, y);
        return false;
    };
    var initHtml = 
        '<div class="controlbar">' +
        '<span id="addnode" class="togglebutton tbselected">ADD NODE</span> ' +
        '</div>' +
        '<div class="controlbar">' +
        '<span id="addactiv_str" class="togglebutton">+ Activator (strong)</span> ' +
        '<span id="addactiv_wk" class="togglebutton">+ Activator (weak)</span> ' +
        '<span id="addrepr_str" class="togglebutton">+ Repressor (strong)</span> ' +
        '<span id="addrepr_wk" class="togglebutton">+ Repressor (weak)</span>' +
        '</div>' +
        '<div id="statusbar">' +
        'x: <span id="mousex">000</span> ' +
        'y: <span id="mousey">000</span> ' +
        '<span id="message1"></span></div>' +
        '<div id="paper"></div>' +
        '<div class="controlbar">' +
        '<span id="rewind" class="timecontrol">Reset</span> ' +
        '<span id="play" class="timecontrol">Play</span> ' +
        '<span id="display-time">00:00:000</span>' +
        '</div>';

    function updateEditModeButtons(buttonIndex) {
        var buttons = [$('#addnode'),$('#addactiv_str'), $('#addactiv_wk'), $('#addrepr_str'), $('#addrepr_wk')];
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].removeClass("tbselected");
            if (i == buttonIndex) {
                buttons[i].addClass("tbselected");
            }
        }
    }
    var playing = false;
    var TIME_INCREMENT = 50;
    var millis = 0, seconds = 0, minutes = 0;
    var increment0 = 1, increment1 = 1, increment2 = 1; // TODO: this is only demo

    isb.setupNetworkEditor = function(config) {
        var width = config.dimensions.width;
        var height = config.dimensions.height;

        $(initHtml).replaceAll('#' + config.id);
        var paper = Raphael(document.getElementById('paper'), width, height);
        var border = paper.rect(0, 0, width, height);
        border.attr("stroke", "#000");
        isb.editor = new Editor(paper);

        isb.editor.drawNodes(config.nodes);
        $('#paper').click(isb.canvasClick);
        $('#paper').mousemove(isb.canvasMouseMove);
        $('#addnode').click(function() {
            updateEditModeButtons(0);
            isb.editor.CreateMode ='Node'
        });
        $('#addactiv_str').click(function() {
            updateEditModeButtons(1);
            isb.editor.edgeStrokeWidth = 3;
            isb.editor.edgeStrokeColor = '#000';
            isb.editor.CreateMode ='Edge'
        });
        $('#addactiv_wk').click(function() {
            updateEditModeButtons(2);
            isb.editor.edgeStrokeWidth = 1;
            isb.editor.edgeStrokeColor = '#000';
            isb.editor.CreateMode ='Edge'
        });
        $('#addrepr_str').click(function() {
            updateEditModeButtons(3);
            isb.editor.edgeStrokeWidth = 3;
            isb.editor.edgeStrokeColor = '#f00';
            isb.editor.CreateMode ='Edge';;
        });
        $('#addrepr_wk').click(function() {
            updateEditModeButtons(4);
            isb.editor.edgeStrokeWidth = 1;
            isb.editor.edgeStrokeColor = '#f00';
            isb.editor.CreateMode ='Edge';
        });

        $('#rewind').click(function() {
            $('#rewind').addClass('tcactive');
            setTimeout(function() {
                $('#rewind').removeClass('tcactive');
            }, TIME_INCREMENT);
            millis = seconds = minutes = 0;
            displayTime();
        });
        $('#play').click(function() {
            if (!playing) {
                $('#play').addClass('tcactive');
            } else {
                $('#play').removeClass('tcactive');
            }
            playing = !playing;
            if (playing) setTimeout(runSimulation, TIME_INCREMENT);
        });
    };
    function numString2(number) {
        var result = '';
        if (number < 10) result += '0';
        return result + number;
    }
    function numString3(number) {
        var result = '';
        if (number < 100) result += '0';
        return result + numString2(number);
    }
    function displayTime() {
        var str = numString2(minutes) + ':' + numString2(seconds) + ':' + numString3(millis);

        $('<span id="display-time">' + str + '</span>').replaceAll('#display-time');
    }

    function runSimulation() {
        millis += TIME_INCREMENT;
        if (millis >= 1000) {
            seconds++;
            millis -= 1000;
            if (seconds >= 60) {
                minutes++;
                seconds -= 60;
            }
        }
        // simulate circle 0
        var r0_orig = isb.editor.nodeAt(0).attr('r');
        if (r0_orig >= 50) increment0 = -1;
        else if (r0_orig < 10) increment0 = 2;
        isb.editor.nodeAt(0).attr('r', r0_orig + increment0);

        // simulate circle 1
        var r1_orig = isb.editor.nodeAt(1).attr('r');
        if (r1_orig >= 60) increment1 = -1;
        else if (r1_orig < 15) increment1 = 1;
        isb.editor.nodeAt(1).attr('r', r1_orig + increment1);

        // simulate circle 2
        var r2_orig = isb.editor.nodeAt(2).attr('r');
        if (r2_orig >= 30) increment2 = -1;
        else if (r2_orig < 5) increment2 = 1;
        isb.editor.nodeAt(2).attr('r', r2_orig + increment2);
        
        // simulate circle 3
        var r3_orig = isb.editor.nodeAt(3).attr('r');
        if (r3_orig >= 30) increment3 = -1;
        else if (r3_orig < 5) increment3 = 1;
        isb.editor.nodeAt(3).attr('r', r3_orig + increment3);

        // adapt the end points of the edges as well
        isb.editor.updateEdges();

        displayTime();
        if (playing) setTimeout(runSimulation, TIME_INCREMENT);
    }

}());
