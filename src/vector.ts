
export default class Vector {
    x: number;
    y: number;
    z: number;

    static add(a: Vector, b: Vector): Vector {
        return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z};
    }
    
    static sub(a: Vector, b: Vector): Vector {
        return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
    }
    
    static mult(a: Vector, b: number): Vector {
        return {x: a.x * b, y: a.y * b, z: a.z * b};
    }
    
    static div(a: Vector, b: number): Vector {
        return {x: a.x / b, y: a.y / b, z: a.z / b};
    }
}