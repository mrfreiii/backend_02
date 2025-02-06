export const replaceMongo_idByid = (value: any)=>{
    const {_id, ...rest} = value;
    return {id: _id?.toString(), ...rest};
}