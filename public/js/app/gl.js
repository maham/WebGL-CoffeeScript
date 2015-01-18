// Generated by CoffeeScript 1.8.0
(function() {
  define(['app/mesh', 'app/objparser'], function(Mesh, ObjParser) {
    var GL;
    return GL = (function() {
      function GL(canvasElementId) {
        var canvasElement, error;
        this._pMatrix = mat4.create();
        this._mvMatrix = mat4.create();
        this._mvMatrixStack = [];
        canvasElement = document.getElementById(canvasElementId);
        try {
          this._gl = canvasElement.getContext('webgl' || canvasElement.getContext('experimental-webgl'));
        } catch (_error) {
          error = _error;
          console.log('Failed to initialize WebGL using the element ' + canvas + '. Error:\n' + error);
          throw error;
        }
        this._gl.viewportWidth = canvasElement.width;
        this._gl.viewportHeight = canvasElement.height;
        mat4.perspective(this._pMatrix, 45, canvasElement.width / canvasElement.height, 0.1, 100.0, this._pMatrix);
        this._gl.viewport(0, 0, canvasElement.width, canvasElement.height);
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
      }

      GL.prototype.fetchShaderFromElement = function(shaderElementId) {
        var currentScriptNode, shaderCode, shaderElement;
        shaderElement = document.getElementById(shaderElementId);
        if (!shaderElement) {
          throw new Error('No shader with id: ' + shaderElementId);
        }
        if (!(shaderElement.type === 'x-shader/x-fragment' || shaderScript.type === 'x-shader/x-vertex')) {
          throw new Error('Not a shader element: ' + shaderElement);
        }
        shaderCode = "";
        currentScriptNode = shaderElement.firstChild;
        while (currentScriptNode) {
          if (currentScriptNode.nodeType === 3) {
            shaderCode += currentScriptNode.textContent;
          }
          currentScriptNode = currentScriptNode.nextSibling;
        }
        return shaderCode;
      };

      GL.prototype.compileShader = function(shaderCode, shaderType) {
        var shader;
        shader = this._gl.createShader(shaderType);
        this._gl.shaderSource(shader, shaderCode);
        this._gl.compileShader(shader);
        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
          throw new Error(this._gl.getShaderInfoLog);
        }
        return shader;
      };

      GL.prototype.initShaders = function(fragmentShaderElementId, vertexShaderElementId) {
        this._fragmentShader = this.compileShader(this.fetchShaderFromElement(fragmentShaderElementId), this._gl.FRAGMENT_SHADER);
        return this._vertexShader = this.compileShader(this.fetchShaderFromElement(vertexShaderElementId), this._gl.VERTEX_SHADER);
      };

      GL.prototype.createShaderProgram = function(fragmentShaderSource, vertexShaderSource) {
        var shaderProgram;
        shaderProgram = this._gl.createProgram();
        this._gl.attachShader(shaderProgram, this.compileShader(fragmentShaderSource, this._gl.FRAGMENT_SHADER));
        this._gl.attachShader(shaderProgram, this.compileShader(vertexShaderSource, this._gl.VERTEX_SHADER));
        this._gl.linkProgram(shaderProgram);
        if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
          throw new Error('Could not initialize shaders.');
        }
        return shaderProgram;
      };

      GL.prototype.setShader = function(_shaderProgram) {
        this._shaderProgram = _shaderProgram;
        this._gl.useProgram(this._shaderProgram);
        this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aVertexPosition');
        if (this._shaderProgram.vertexPositionAttribute == null) {
          throw Error('Failed to get reference to "aVertexPosition" in shader program.');
        }
        this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);
        this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, 'uMVMatrix');
        if (this._shaderProgram.mvMatrixUniform == null) {
          throw Error('Failed to get reference to "uMVMatrix" in shader program.');
        }
      };

      GL.prototype.createMesh = function(settings) {
        var indexBuffer, vertexBuffer;
        vertexBuffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(settings.vertices), this._gl.STATIC_DRAW);
        indexBuffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(settings.indices), this._gl.STATIC_DRAW);
        return new Mesh({
          vertexBuffer: vertexBuffer,
          vertexSize: settings.vertexSize,
          numVertices: settings.vertices.length / settings.vertexSize,
          indexBuffer: indexBuffer,
          numIndices: settings.indices.length,
          position: settings.position,
          rotation: [0, 0, 0]
        });
      };

      GL.prototype.createMeshFromObj = function(objData, position) {
        var parser;
        parser = new ObjParser;
        parser.parse(objData);
        return this.createMesh({
          vertices: parser.out,
          vertexSize: 3,
          indices: parser.indices,
          numIndices: parser.indices.length,
          position: [0, 0, 0]
        });
      };

      GL.prototype.setMvMatrix = function(modelMatrix, viewMatrix, projectionMatrix) {
        var mvMatrix;
        mvMatrix = mat4.create();
        mat4.multiply(mvMatrix, modelMatrix, viewMatrix);
        mat4.multiply(mvMatrix, mvMatrix, projectionMatrix);
        return this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, mvMatrix);
      };

      GL.prototype.pushMatrix = function() {
        return this._mvMatrixStack.push(mat4.clone(this._mvMatrix));
      };

      GL.prototype.popMatrix = function() {
        if (this._mvMatrixStack.length < 1) {
          throw Error('Invalid popMatrix');
        }
        return this._mvMatrix = this._mvMatrixStack.pop();
      };

      GL.prototype.deg2Rad = function(degrees) {
        return degrees * Math.PI / 180;
      };

      GL.prototype.drawScene = function(camera, meshes) {
        var mesh, modelMatrix, viewMatrix, _i, _len, _results;
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        viewMatrix = camera.getViewMatrix();
        _results = [];
        for (_i = 0, _len = meshes.length; _i < _len; _i++) {
          mesh = meshes[_i];
          this._gl.bindBuffer(this._gl.ARRAY_BUFFER, mesh.vertexBuffer);
          this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, mesh.vertexSize, this._gl.FLOAT, false, 0, 0);
          this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
          modelMatrix = mat4.create();
          mat4.translate(modelMatrix, modelMatrix, mesh.position);
          mat4.rotateX(modelMatrix, modelMatrix, this.deg2Rad(mesh.rotation[0]));
          mat4.rotateY(modelMatrix, modelMatrix, this.deg2Rad(mesh.rotation[1]));
          mat4.rotateZ(modelMatrix, modelMatrix, this.deg2Rad(mesh.rotation[2]));
          mat4.multiply(modelMatrix, viewMatrix, modelMatrix);
          mat4.multiply(modelMatrix, this._pMatrix, modelMatrix);
          this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, modelMatrix);
          _results.push(this._gl.drawElements(this._gl.TRIANGLES, mesh.numIndices, this._gl.UNSIGNED_SHORT, 0));
        }
        return _results;
      };

      return GL;

    })();
  });

}).call(this);
