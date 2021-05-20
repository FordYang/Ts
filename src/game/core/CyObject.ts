import { IPoolObject } from "./memop/IPoolObject";

export default class CyObject
{
	//---------------------------------------------------------------------------------------------------------------

	protected isDispose: boolean = false;
    private isDispose1:boolean = false;
	public destroy(): void 
	{
		if (this.isDispose1 === false) 
		{
			this.isDispose1 = true;

			this.onDestroy();

            this.isDispose = true;
		}
	}

	protected onDestroy(): void 
	{

	}
}